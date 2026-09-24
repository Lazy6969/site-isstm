<?php

use App\Models\User;
use App\Role;

it('refreshes last_activity on a community request', function () {
    $user = User::factory()->role(Role::Etudiant)->create(['last_activity' => now()->subHour()]);

    $this->actingAs($user)->get('/communaute')->assertOk();

    expect($user->fresh()->last_activity->diffInSeconds(now()))->toBeLessThan(5);
});

it('does not touch last_activity for a request outside the community area', function () {
    $user = User::factory()->role(Role::Etudiant)->create(['last_activity' => now()->subHour()]);

    $this->actingAs($user)->get('/');

    expect($user->fresh()->last_activity->diffInSeconds(now()))->toBeGreaterThan(60);
});
