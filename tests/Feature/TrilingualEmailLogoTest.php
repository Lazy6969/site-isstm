<?php

use App\Models\User;
use App\Notifications\AccountReactivated;
use App\Notifications\QueuedResetPassword;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Notifications\Channels\MailChannel;
use Illuminate\Support\Facades\Event;

it('embeds the ISSTM logo as a cid attachment rather than a broken local asset URL', function () {
    $user = User::factory()->create();

    $sent = null;
    Event::listen(MessageSent::class, function (MessageSent $event) use (&$sent) {
        $sent = $event->message;
    });

    app(MailChannel::class)->send($user, new AccountReactivated);

    expect($sent)->not->toBeNull();
    $html = $sent->getHtmlBody();

    expect($html)->toContain('src="cid:')
        ->and($html)->not->toContain(asset('images/logo-isstm.png'));
});

it('embeds the ISSTM logo as a cid attachment in the default markdown mail layout too', function () {
    // Covers notifications that render through Laravel's own markdown layout
    // (resources/views/vendor/mail/html/*) rather than emails/trilingual.blade.php —
    // e.g. QueuedResetPassword — which used to leak a bare asset() URL pointing at
    // the local .test domain, invisible in any real inbox.
    $user = User::factory()->create();

    $sent = null;
    Event::listen(MessageSent::class, function (MessageSent $event) use (&$sent) {
        $sent = $event->message;
    });

    app(MailChannel::class)->send($user, new QueuedResetPassword('fake-token'));

    expect($sent)->not->toBeNull();
    $html = $sent->getHtmlBody();

    expect($html)->toContain('src="cid:')
        ->and($html)->not->toContain(asset('images/logo-isstm.png'));
});
