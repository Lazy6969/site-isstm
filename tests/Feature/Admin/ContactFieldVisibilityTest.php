<?php

use App\Http\Controllers\Admin\ContactFieldVisibilityController;
use App\Models\User;
use App\Role;

it('forbids a user without quick-edit.layout from toggling a contact field', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)
        ->post('/console/contact-fields/toggle', ['field' => 'email'])
        ->assertForbidden();
});

it('lets a super admin hide a contact field, then show it again', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->post('/console/contact-fields/toggle', ['field' => 'facebook'])
        ->assertRedirect();
    expect(ContactFieldVisibilityController::hidden())->toBe(['facebook']);

    $this->actingAs($admin)
        ->post('/console/contact-fields/toggle', ['field' => 'facebook'])
        ->assertRedirect();
    expect(ContactFieldVisibilityController::hidden())->toBe([]);
});

it('rejects an unknown contact field key', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->post('/console/contact-fields/toggle', ['field' => 'not-a-field'])
        ->assertSessionHasErrors('field');
});

it('exposes hidden contact fields globally, to both the homepage and the contact page', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $this->actingAs($admin)->post('/console/contact-fields/toggle', ['field' => 'carte_annexe']);

    $this->get('/')->assertInertia(fn ($page) => $page->where('hiddenContactFields', ['carte_annexe']));
    $this->get('/contact')->assertInertia(fn ($page) => $page->where('hiddenContactFields', ['carte_annexe']));
});
