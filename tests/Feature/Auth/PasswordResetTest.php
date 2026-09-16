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
