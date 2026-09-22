<?php

use App\Models\SiteContent;
use App\Models\User;
use App\Role;
use App\SiteContentType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role as SpatieRole;

it('requires authentication to update content', function () {
    $content = SiteContent::factory()->create();

    $this->post('/console/content/update', ['key' => $content->content_key, 'value' => 'Nouveau texte'])
        ->assertRedirect('/login');
});

it('forbids a user without the quick-edit.text permission', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();
    $content = SiteContent::factory()->create();

    $this->actingAs($etudiant)
        ->post('/console/content/update', ['key' => $content->content_key, 'value' => 'Nouveau texte'])
        ->assertForbidden();
});

it('forbids a scolarité user without quick-edit permissions', function () {
    $scolarite = User::factory()->create();
    $scolarite->assignRole('scolarite');
    $content = SiteContent::factory()->create();

    $this->actingAs($scolarite)
        ->post('/console/content/update', ['key' => $content->content_key, 'value' => 'Nouveau texte'])
        ->assertForbidden();
});

it('rejects an unknown content key', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->post('/console/content/update', ['key' => 'clef.inexistante', 'value' => 'Nouveau texte'])
        ->assertSessionHasErrors('key');
});

it('lets a super admin update a content value for the active locale', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create([
        'content_key' => 'mission_contenu',
        'content_value_fr' => 'Ancien texte',
        'content_value_en' => 'Old text',
    ]);

    $this->actingAs($admin)
        ->post('/console/content/update', ['key' => 'mission_contenu', 'value' => 'Nouveau texte'])
        ->assertRedirect();

    $content->refresh();
    expect($content->content_value_fr)->toBe('Nouveau texte');
    expect($content->content_value_en)->toBe('Old text');
});

it('lets a super admin target an explicit locale regardless of the active site locale', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create([
        'content_key' => 'mission_contenu',
        'content_value_fr' => 'Texte fr',
        'content_value_en' => 'Texte en',
        'content_value_mg' => 'Texte mg',
    ]);

    $this->actingAs($admin)
        ->post('/console/content/update', ['key' => 'mission_contenu', 'value' => 'Nouveau texte anglais', 'locale' => 'en'])
        ->assertRedirect();

    $content->refresh();
    expect($content->content_value_en)->toBe('Nouveau texte anglais');
    expect($content->content_value_fr)->toBe('Texte fr');
    expect($content->content_value_mg)->toBe('Texte mg');
});

it('strips HTML tags from the submitted value', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create(['content_key' => 'mission_contenu']);

    $this->actingAs($admin)->post('/console/content/update', [
        'key' => 'mission_contenu',
        'value' => '<script>alert(1)</script>Texte propre',
    ]);

    expect($content->refresh()->content_value_fr)->toBe('alert(1)Texte propre');
});

it('lets a super admin pick a whitelisted icon and syncs it across every locale', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create([
        'content_key' => 'stat_students_icon',
        'type' => SiteContentType::Icon,
        'content_value_fr' => 'GraduationCap',
        'content_value_en' => 'GraduationCap',
        'content_value_mg' => 'GraduationCap',
    ]);

    $this->actingAs($admin)
        ->post('/console/content/update', ['key' => 'stat_students_icon', 'value' => 'Star'])
        ->assertRedirect();

    $content->refresh();
    expect($content->content_value_fr)->toBe('Star');
    expect($content->content_value_en)->toBe('Star');
    expect($content->content_value_mg)->toBe('Star');
});

it('rejects an icon value outside the SiteIcon whitelist', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    SiteContent::factory()->create(['content_key' => 'stat_students_icon', 'type' => SiteContentType::Icon]);

    $this->actingAs($admin)
        ->post('/console/content/update', ['key' => 'stat_students_icon', 'value' => '<img onerror=alert(1)>'])
        ->assertSessionHasErrors('value');
});

it('forbids a user with quick-edit.text but not quick-edit.icon from changing an icon', function () {
    $textOnlyRole = SpatieRole::findOrCreate('content-editor', 'web');
    $textOnlyRole->givePermissionTo(['quick-edit.access', 'quick-edit.text']);
    $editor = User::factory()->create();
    $editor->assignRole('content-editor');
    SiteContent::factory()->create(['content_key' => 'stat_students_icon', 'type' => SiteContentType::Icon]);
    $textContent = SiteContent::factory()->create(['content_key' => 'mission_contenu']);

    $this->actingAs($editor)
        ->post('/console/content/update', ['key' => 'stat_students_icon', 'value' => 'Star'])
        ->assertForbidden();

    // Sanity check: the same user *can* edit text content with that permission.
    $this->actingAs($editor)
        ->post('/console/content/update', ['key' => 'mission_contenu', 'value' => 'Texte modifié'])
        ->assertRedirect();

    expect($textContent->refresh()->content_value_fr)->toBe('Texte modifié');
});

it('lets a super admin upload a replacement image and syncs the path across every locale', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create([
        'content_key' => 'mission_image_path',
        'type' => SiteContentType::Image,
        'content_value_fr' => 'images/mission.jpg',
        'content_value_en' => 'images/mission.jpg',
        'content_value_mg' => 'images/mission.jpg',
    ]);

    $this->actingAs($admin)
        ->post('/console/content/update', ['key' => 'mission_image_path', 'file' => UploadedFile::fake()->image('nouvelle.jpg')])
        ->assertRedirect();

    $content->refresh();
    expect($content->content_value_fr)->toStartWith('storage/site-content/');
    expect($content->content_value_fr)->toBe($content->content_value_en)
        ->and($content->content_value_fr)->toBe($content->content_value_mg);
    Storage::disk('public')->assertExists(str($content->content_value_fr)->after('storage/'));
});

it('deletes the previous uploaded image when replaced, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create([
        'content_key' => 'mission_image_path',
        'type' => SiteContentType::Image,
        'content_value_fr' => 'images/mission.jpg',
    ]);

    // First upload: the original bundled asset must not be touched.
    $this->actingAs($admin)->post('/console/content/update', [
        'key' => 'mission_image_path',
        'file' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($content->refresh()->content_value_fr)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);

    // Second upload: the first *uploaded* file should now be cleaned up.
    $this->actingAs($admin)->post('/console/content/update', [
        'key' => 'mission_image_path',
        'file' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('rejects a non-image file for an image content key', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    SiteContent::factory()->create(['content_key' => 'mission_image_path', 'type' => SiteContentType::Image]);

    $this->actingAs($admin)
        ->post('/console/content/update', ['key' => 'mission_image_path', 'file' => UploadedFile::fake()->create('malware.php', 10)])
        ->assertSessionHasErrors('file');
});
