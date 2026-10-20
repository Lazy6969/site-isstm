<?php

use App\Models\User;
use App\Role;

it('saves a profile submitted the way the panel sends it (empty avatar and phone)', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $target = User::factory()->create(['name' => 'Ancien', 'email' => 'ancien@example.com', 'phone' => '0340000000']);

    $this->actingAs($admin)->post("/console/users/{$target->id}/profile", [
        'name' => 'Nouveau',
        'email' => 'ancien@example.com',
        'phone' => '',
        'avatar' => '',
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect($target->fresh()->name)->toBe('Nouveau')->and($target->fresh()->phone)->toBeNull();
});
