<?php

use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-privileged user from listing users', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/users')->assertForbidden();
});

it('lets the super admin list users', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    User::factory()->count(2)->create();

    $this->actingAs($admin)->get('/console/users')->assertOk();
});

it('lets the super admin change another user\'s role', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $target = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($admin)
        ->put("/console/users/{$target->id}/role", ['role' => 'enseignant'])
        ->assertRedirect();

    expect($target->fresh()->hasRole('enseignant'))->toBeTrue();
});

it('forbids a user from changing their own role', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->put("/console/users/{$admin->id}/role", ['role' => 'etudiant'])
        ->assertForbidden();
});

it('lets the super admin deactivate and reactivate another user', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $target = User::factory()->create(['is_active' => true]);

    $this->actingAs($admin)->post("/console/users/{$target->id}/toggle-active")->assertRedirect();
    expect($target->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->post("/console/users/{$target->id}/toggle-active")->assertRedirect();
    expect($target->fresh()->is_active)->toBeTrue();
});

it('forbids a user from deactivating their own account', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post("/console/users/{$admin->id}/toggle-active")->assertForbidden();
});

it('lets the super admin edit another user\'s name, email, phone and photo', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $target = User::factory()->create(['name' => 'Ancien Nom', 'email' => 'ancien@example.com']);

    $this->actingAs($admin)->post("/console/users/{$target->id}/profile", [
        'name' => 'Nouveau Nom',
        'email' => 'nouveau@example.com',
        'phone' => '0340000000',
        'avatar' => UploadedFile::fake()->image('photo.jpg'),
    ])->assertRedirect();

    $target->refresh();
    expect($target->name)->toBe('Nouveau Nom');
    expect($target->email)->toBe('nouveau@example.com');
    expect($target->phone)->toBe('0340000000');
    Storage::disk('public')->assertExists($target->avatar_path);
});

it('rejects an email already used by another account', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    User::factory()->create(['email' => 'taken@example.com']);
    $target = User::factory()->create();

    $this->actingAs($admin)->post("/console/users/{$target->id}/profile", [
        'name' => $target->name,
        'email' => 'taken@example.com',
    ])->assertSessionHasErrors('email');
});

it('rejects a non-image file as an avatar', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $target = User::factory()->create();

    $this->actingAs($admin)->post("/console/users/{$target->id}/profile", [
        'name' => $target->name,
        'email' => $target->email,
        'avatar' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('avatar');
});

it('forbids a non-privileged user from editing another user\'s profile', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();
    $target = User::factory()->create();

    $this->actingAs($etudiant)->post("/console/users/{$target->id}/profile", [
        'name' => 'Hacked Name',
        'email' => $target->email,
    ])->assertForbidden();
});
