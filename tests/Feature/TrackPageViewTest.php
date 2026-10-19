<?php

use App\Models\PageView;
use App\Models\User;
use App\Role;

it('counts a full page visit on the public site', function () {
    $this->get('/')->assertOk();

    expect(PageView::count())->toBe(1);
});

it('counts a full page visit inside the espace étudiant', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->get('/communaute')->assertOk();

    expect(PageView::where('path', '/communaute')->count())->toBe(1);
});

it('does not count a visit to the admin console', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/dashboard')->assertOk();

    expect(PageView::count())->toBe(0);
});

it('does not count a plain JSON fetch endpoint', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->getJson('/stories')->assertOk();

    expect(PageView::count())->toBe(0);
});

it('does not count a partial Inertia reload', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    // Only the header TrackPageView itself inspects — X-Inertia isn't added
    // here, since that would also trigger Inertia's own asset-version check
    // (a 409 when it doesn't match), which is unrelated to what this test
    // verifies.
    $this->actingAs($user)->get('/communaute', [
        'X-Inertia-Partial-Data' => 'posts',
    ])->assertOk();

    expect(PageView::count())->toBe(0);
});

it('does not count a form submission', function () {
    $this->post('/newsletter', ['email' => 'test@example.com']);

    expect(PageView::count())->toBe(0);
});
