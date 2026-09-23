<?php

use App\Http\Controllers\Admin\SectionVisibilityController;
use App\Models\User;
use App\Role;

it('forbids a user without quick-edit.layout from toggling a section', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)
        ->post('/console/sections/toggle', ['section' => 'stats'])
        ->assertForbidden();
});

it('lets a super admin hide a homepage section, then show it again', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->post('/console/sections/toggle', ['section' => 'stats'])
        ->assertRedirect();
    expect(SectionVisibilityController::hidden())->toBe(['stats']);

    $this->actingAs($admin)
        ->post('/console/sections/toggle', ['section' => 'stats'])
        ->assertRedirect();
    expect(SectionVisibilityController::hidden())->toBe([]);
});

it('rejects an unknown section key', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->post('/console/sections/toggle', ['section' => 'not-a-section'])
        ->assertSessionHasErrors('section');
});

it('exposes hidden sections to the homepage so visitors never see them', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $this->actingAs($admin)->post('/console/sections/toggle', ['section' => 'partenaires']);

    $this->get('/')->assertInertia(fn ($page) => $page
        ->component('Home')
        ->where('hiddenSections', ['partenaires'])
    );
});
