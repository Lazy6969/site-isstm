<?php

use App\Models\SiteContent;
use App\Models\SiteContentRevision;
use App\Models\User;
use App\Role;
use App\SiteContentType;
use Spatie\Permission\Models\Role as SpatieRole;

it('forbids a non-privileged user from viewing the content history', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/contenu/historique')->assertForbidden();
});

it('lets a super admin view the content history', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/contenu/historique')->assertOk();
});

it('snapshots the previous value every time a text content is edited', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create([
        'content_key' => 'mission_contenu',
        'content_value_fr' => 'Ancien texte',
    ]);

    $this->actingAs($admin)->post('/console/content/update', ['key' => 'mission_contenu', 'value' => 'Nouveau texte']);

    $revision = SiteContentRevision::where('content_key', 'mission_contenu')->first();
    expect($revision)->not->toBeNull();
    expect($revision->content_value_fr)->toBe('Ancien texte');
    expect($revision->changed_by)->toBe($admin->id);
});

it('lets a super admin restore a previous revision', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create([
        'content_key' => 'mission_contenu',
        'content_value_fr' => 'Texte actuel',
        'content_value_en' => 'Current text',
        'content_value_mg' => 'Lahatsoratra ankehitriny',
    ]);
    $revision = SiteContentRevision::create([
        'site_content_id' => $content->id,
        'content_key' => 'mission_contenu',
        'type' => SiteContentType::Text,
        'content_value_fr' => 'Texte historique',
        'content_value_en' => 'Old text',
        'content_value_mg' => 'Lahatsoratra taloha',
        'changed_by' => $admin->id,
    ]);

    $this->actingAs($admin)->post("/console/content/{$revision->id}/restore")->assertRedirect();

    $content->refresh();
    expect($content->content_value_fr)->toBe('Texte historique');
    expect($content->content_value_en)->toBe('Old text');
    expect($content->content_value_mg)->toBe('Lahatsoratra taloha');
});

it('snapshots the state right before restoring, so a restore is itself undoable', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $content = SiteContent::factory()->create([
        'content_key' => 'mission_contenu',
        'content_value_fr' => 'Texte actuel',
    ]);
    $revision = SiteContentRevision::create([
        'site_content_id' => $content->id,
        'content_key' => 'mission_contenu',
        'type' => SiteContentType::Text,
        'content_value_fr' => 'Texte historique',
        'changed_by' => $admin->id,
    ]);

    $this->actingAs($admin)->post("/console/content/{$revision->id}/restore");

    $preRestoreSnapshot = SiteContentRevision::where('content_key', 'mission_contenu')
        ->where('content_value_fr', 'Texte actuel')
        ->exists();
    expect($preRestoreSnapshot)->toBeTrue();
});

it('forbids restoring without the matching quick-edit permission', function () {
    $iconOnlyRole = SpatieRole::findOrCreate('icon-editor-test', 'web');
    $iconOnlyRole->givePermissionTo(['quick-edit.access', 'quick-edit.icon']);
    $editor = User::factory()->create();
    $editor->assignRole('icon-editor-test');

    $content = SiteContent::factory()->create(['content_key' => 'mission_contenu', 'type' => SiteContentType::Text]);
    $revision = SiteContentRevision::create([
        'site_content_id' => $content->id,
        'content_key' => 'mission_contenu',
        'type' => SiteContentType::Text,
        'content_value_fr' => 'Texte historique',
    ]);

    $this->actingAs($editor)->post("/console/content/{$revision->id}/restore")->assertForbidden();
});
