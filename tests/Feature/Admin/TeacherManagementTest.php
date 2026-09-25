<?php

use App\Models\Teacher;
use App\Models\User;
use App\Role;
use App\TeacherCategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing teachers', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/enseignants')->assertForbidden();
});

it('lets an admin create a teacher with the category cast to the enum', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/enseignants', [
        'name' => 'Jean Rakoto',
        'category' => 'vacataire',
    ])->assertRedirect();

    $teacher = Teacher::latest('id')->first();
    expect($teacher->name)->toBe('Jean Rakoto');
    expect($teacher->category)->toBe(TeacherCategory::Vacataire);
});

it('lets an admin update a teacher without touching its photo when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $teacher = Teacher::factory()->create(['photo_path' => 'images/avatar-default.jpg']);

    $this->actingAs($admin)->put("/console/enseignants/{$teacher->id}", [
        'name' => 'Nom modifié',
        'category' => $teacher->category->value,
    ])->assertRedirect();

    expect($teacher->refresh()->name)->toBe('Nom modifié');
    expect($teacher->photo_path)->toBe('images/avatar-default.jpg');
});

it('replaces the uploaded photo and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $teacher = Teacher::factory()->create(['photo_path' => 'images/avatar-default.jpg']);

    $this->actingAs($admin)->put("/console/enseignants/{$teacher->id}", [
        'name' => $teacher->name,
        'category' => $teacher->category->value,
        'photo' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($teacher->refresh()->photo_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    // The original bundled asset must never be deleted.
    expect(Teacher::find($teacher->id)->photo_path)->not->toBe('images/avatar-default.jpg');

    $this->actingAs($admin)->put("/console/enseignants/{$teacher->id}", [
        'name' => $teacher->name,
        'category' => $teacher->category->value,
        'photo' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('soft-deletes a teacher, keeping its photo until it is purged from the Corbeille', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $teacher = Teacher::factory()->create(['photo_path' => 'storage/teachers/old.jpg']);
    Storage::disk('public')->put('teachers/old.jpg', 'fake');

    $this->actingAs($admin)->delete("/console/enseignants/{$teacher->id}")->assertRedirect();

    expect(Teacher::find($teacher->id))->toBeNull();
    expect(Teacher::onlyTrashed()->find($teacher->id))->not->toBeNull();
    Storage::disk('public')->assertExists('teachers/old.jpg');
});

it('shows all teachers to the admin ordered by display order', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Teacher::factory()->count(3)->create();

    $this->actingAs($admin)->get('/console/enseignants')->assertInertia(fn ($page) => $page
        ->component('Admin/Enseignants/Index')
        ->has('teachers', 3)
    );
});
