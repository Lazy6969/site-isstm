<?php

use App\Models\User;

it('redirects guests who try to toggle the online status', function () {
    $this->patch('/profil/statut-en-ligne')->assertRedirect('/login');
});

it('lets a user turn their own online status off and back on', function () {
    $user = User::factory()->create()->refresh();
    expect($user->show_online_status)->toBeTrue();

    $this->actingAs($user)->patch('/profil/statut-en-ligne')->assertRedirect();
    expect($user->refresh()->show_online_status)->toBeFalse();

    $this->actingAs($user)->patch('/profil/statut-en-ligne')->assertRedirect();
    expect($user->refresh()->show_online_status)->toBeTrue();
});

it('hides presence from others once the online status is turned off, even while active', function () {
    $user = User::factory()->create(['last_activity' => now()])->refresh();
    expect($user->isVisiblyOnline())->toBeTrue();

    $user->update(['show_online_status' => false]);
    expect($user->isVisiblyOnline())->toBeFalse();
});
