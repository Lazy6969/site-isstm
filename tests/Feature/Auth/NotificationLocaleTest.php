<?php

use App\Models\User;
use App\Notifications\QueuedResetPassword;
use App\Notifications\QueuedVerifyEmail;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * QueuedResetPassword/QueuedVerifyEmail are ShouldQueue, so a real queue
 * worker renders them later in its own process — with no HTTP session to
 * read, it falls back to config('app.locale') regardless of what language
 * the visitor's session (SetLocale middleware) was actually in. User::
 * sendPasswordResetNotification()/sendEmailVerificationNotification() work
 * around this by capturing app()->getLocale() onto the notification itself
 * *before* queueing — Illuminate\Notifications\Notification::$locale
 * survives serialization and is what the worker uses to render, regardless
 * of its own ambient locale.
 */
it('captures the current session locale onto the password-reset notification before queueing it', function () {
    Notification::fake();
    app()->setLocale('mg');
    $user = User::factory()->create();

    $user->sendPasswordResetNotification('fake-token');

    Notification::assertSentTo($user, QueuedResetPassword::class, fn ($notification) => $notification->locale === 'mg');
});

it('captures the current session locale onto the verify-email notification before queueing it', function () {
    Notification::fake();
    app()->setLocale('en');
    $user = User::factory()->create();

    $user->sendEmailVerificationNotification();

    Notification::assertSentTo($user, QueuedVerifyEmail::class, fn ($notification) => $notification->locale === 'en');
});

it('renders the password-reset e-mail in French even while the ambient (queue worker) locale is English', function () {
    $user = User::factory()->create();

    $sent = null;
    Event::listen(MessageSent::class, function (MessageSent $event) use (&$sent) {
        $sent = $event->message;
    });

    app()->setLocale('en');
    $user->notify((new QueuedResetPassword('fake-token'))->locale('fr'));

    expect($sent)->not->toBeNull();
    $html = $sent->getHtmlBody();

    expect($html)->toContain('Réinitialisation du mot de passe')
        ->and($html)->not->toContain('Reset Password Notification');
});
