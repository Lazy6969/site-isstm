<?php

use App\Models\CampusBloc;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing campus blocs', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/campus')->assertForbidden();
});

it('lets an admin create a campus bloc', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/campus', [
        'bloc_key' => 'bloc-a',
        'nom' => 'Bloc A',
    ])->assertRedirect();

    $bloc = CampusBloc::latest('id')->first();
    expect($bloc->bloc_key)->toBe('bloc-a');
    expect($bloc->nom)->toBe('Bloc A');
});

it('rejects a duplicate bloc_key', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    CampusBloc::factory()->create(['bloc_key' => 'bloc-a']);

    $this->actingAs($admin)->post('/console/campus', [
        'bloc_key' => 'bloc-a',
        'nom' => 'Autre nom',
    ])->assertSessionHasErrors('bloc_key');
});

it('lets an admin update a campus bloc', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $bloc = CampusBloc::factory()->create();

    $this->actingAs($admin)->put("/console/campus/{$bloc->id}", [
        'bloc_key' => $bloc->bloc_key,
        'nom' => 'Nom modifié',
    ])->assertRedirect();

    expect($bloc->refresh()->nom)->toBe('Nom modifié');
});

it('adds photos to a campus bloc', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $bloc = CampusBloc::factory()->create(['images' => []]);

    $this->actingAs($admin)->post("/console/campus/{$bloc->id}/photos", [
        'photos' => [UploadedFile::fake()->image('photo1.jpg')],
    ])->assertRedirect();

    expect($bloc->refresh()->images)->toHaveCount(1);
});

it('removes a single photo from a campus bloc by index', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    Storage::disk('public')->put('campus/a.jpg', 'fake');
    Storage::disk('public')->put('campus/b.jpg', 'fake');
    $bloc = CampusBloc::factory()->create(['images' => ['storage/campus/a.jpg', 'storage/campus/b.jpg']]);

    $this->actingAs($admin)->delete("/console/campus/{$bloc->id}/photos/0")->assertRedirect();

    expect($bloc->refresh()->images)->toBe(['storage/campus/b.jpg']);
    Storage::disk('public')->assertMissing('campus/a.jpg');
});

it('deletes a campus bloc and its photos', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    Storage::disk('public')->put('campus/old.jpg', 'fake');
    $bloc = CampusBloc::factory()->create(['images' => ['storage/campus/old.jpg']]);

    $this->actingAs($admin)->delete("/console/campus/{$bloc->id}")->assertRedirect();

    expect(CampusBloc::find($bloc->id))->toBeNull();
    Storage::disk('public')->assertMissing('campus/old.jpg');
});

it('lists campus blocs for the admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    CampusBloc::factory()->count(2)->create();

    $this->actingAs($admin)->get('/console/campus')->assertInertia(fn ($page) => $page
        ->component('Admin/Campus/Index')
        ->has('blocs', 2)
    );
});
