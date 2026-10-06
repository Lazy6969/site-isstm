<?php

use App\Models\User;
use App\Notifications\AccountReactivated;
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
