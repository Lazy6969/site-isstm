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

it('lets an admin create a teacher', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/enseignants', [
        'name' => 'Rakoto Jean',
        'category' => 'permanent',
        'specialty_fr' => 'Réseaux et Télécommunications',
        'email' => 'rakoto@example.com',
    ])->assertRedirect();

    $teacher = Teacher::latest('id')->first();
    expect($teacher->name)->toBe('Rakoto Jean');
    expect($teacher->category)->toBe(TeacherCategory::Permanent);
    expect($teacher->display_order)->toBe(0);
});

it('lets an admin update a teacher without touching its photo when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $teacher = Teacher::factory()->create(['photo_path' => 'images/teacher.jpg']);

    $this->actingAs($admin)->put("/console/enseignants/{$teacher->id}", [
        'name' => 'Nom modifié',
        'category' => $teacher->category->value,
        'specialty_fr' => $teacher->specialty_fr,
    ])->assertRedirect();

    expect($teacher->refresh()->name)->toBe('Nom modifié');
    expect($teacher->photo_path)->toBe('images/teacher.jpg');
});

it('replaces the uploaded photo and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $teacher = Teacher::factory()->create(['photo_path' => 'images/teacher.jpg']);

    $this->actingAs($admin)->put("/console/enseignants/{$teacher->id}", [
        'name' => $teacher->name,
        'category' => $teacher->category->value,
        'specialty_fr' => $teacher->specialty_fr,
        'photo' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($teacher->refresh()->photo_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    expect(Teacher::find($teacher->id)->photo_path)->not->toBe('images/teacher.jpg');

    $this->actingAs($admin)->put("/console/enseignants/{$teacher->id}", [
        'name' => $teacher->name,
        'category' => $teacher->category->value,
        'specialty_fr' => $teacher->specialty_fr,
        'photo' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('deletes a teacher and its uploaded photo', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $teacher = Teacher::factory()->create(['photo_path' => 'storage/enseignants/old.jpg']);
    Storage::disk('public')->put('enseignants/old.jpg', 'fake');

    $this->actingAs($admin)->delete("/console/enseignants/{$teacher->id}")->assertRedirect();

    expect(Teacher::find($teacher->id))->toBeNull();
    Storage::disk('public')->assertMissing('enseignants/old.jpg');
});

it('lists teachers ordered by display order for the admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Teacher::factory()->create(['display_order' => 2]);
    Teacher::factory()->create(['display_order' => 1]);

    $this->actingAs($admin)->get('/console/enseignants')->assertInertia(fn ($page) => $page
        ->component('Admin/Enseignants/Index')
        ->has('teachers', 2)
    );
});
