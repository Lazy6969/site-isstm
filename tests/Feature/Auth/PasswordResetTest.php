<?php

use App\Models\SecurityLog;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

it('sends a reset link for a known email and logs the event', function () {
    Notification::fake();
    $user = User::factory()->create();

    $response = $this->post('/mot-de-passe-oublie', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
    $response->assertSessionHas('status');
    expect(SecurityLog::where('event_type', 'reset_link_sent')->where('identifier', $user->email)->exists())->toBeTrue();
});

it('shows the same generic message for an unknown email without sending anything', function () {
    Notification::fake();

    $response = $this->post('/mot-de-passe-oublie', ['email' => 'nobody@example.com']);

    Notification::assertNothingSent();
    $response->assertSessionHas('status');
    expect(SecurityLog::where('event_type', 'reset_link_unknown_email')->exists())->toBeTrue();
});

it('resets the password with a valid token that meets the strength rules', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $response = $this->post('/reinitialiser-mot-de-passe', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'NewPassw0rd',
        'password_confirmation' => 'NewPassw0rd',
    ]);

    $response->assertRedirect(route('login'));
    expect($user->fresh()->password)->not->toBe($user->password);
});

it('rejects a password that does not meet the strength rules', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $response = $this->from('/reinitialiser-mot-de-passe/'.$token)->post('/reinitialiser-mot-de-passe', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'lowercase',
        'password_confirmation' => 'lowercase',
    ]);

    $response->assertSessionHasErrors('password');
});

it('lets an already-authenticated candidate open and use the reset link instead of bouncing them away', function () {
    // Mirrors a préinscription candidate: auto-logged-in the moment they submitted
    // the form, so their session is already authenticated when they click the
    // e-mailed reset link — this must not be gated behind `guest`.
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $this->actingAs($user)
        ->get('/reinitialiser-mot-de-passe/'.$token.'?email='.urlencode($user->email))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Auth/ResetPassword'));

    $response = $this->actingAs($user)->post('/reinitialiser-mot-de-passe', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'NewPassw0rd',
        'password_confirmation' => 'NewPassw0rd',
    ]);

    $response->assertRedirect(route('login'));
    expect($user->fresh()->password)->not->toBe($user->password);
    $this->assertGuest();
});
