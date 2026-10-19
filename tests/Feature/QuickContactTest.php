<?php

use App\Models\SiteContent;
use App\Notifications\QuickContactMessageReceived;
use Illuminate\Support\Facades\Notification;

it('e-mails the configured recipient and flashes a success message', function () {
    // The migration that introduces this key already seeds a default
    // (see add_contact_formulaire_email_site_content), so the row exists
    // from the very first migration — update it rather than create a
    // second, colliding one.
    SiteContent::where('content_key', 'contact_formulaire_email')->update(['content_value_fr' => 'scolarite@isstm.test']);
    Notification::fake();

    $this->post('/contact/message-rapide', [
        'objet' => 'Question sur les filières',
        'nom' => 'Rakoto',
        'prenoms' => 'Jean',
        'email' => 'jean.rakoto@example.com',
        'telephone' => '034 00 000 00',
        'message' => "Bonjour, j'aimerais des informations sur la filière Génie Civil.",
    ])->assertSessionHas('status');

    Notification::assertSentOnDemand(
        QuickContactMessageReceived::class,
        fn (QuickContactMessageReceived $notification, array $channels, object $notifiable) => $notifiable->routes['mail'] === 'scolarite@isstm.test'
            && $notification->objet === 'Question sur les filières'
            && $notification->nom === 'Rakoto'
            && $notification->prenoms === 'Jean'
            && $notification->fromEmail === 'jean.rakoto@example.com'
            && $notification->telephone === '034 00 000 00',
    );
});

it('accepts the message without a phone number', function () {
    SiteContent::where('content_key', 'contact_formulaire_email')->update(['content_value_fr' => 'scolarite@isstm.test']);
    Notification::fake();

    $this->post('/contact/message-rapide', [
        'objet' => 'Question',
        'nom' => 'Rakoto',
        'prenoms' => 'Jean',
        'email' => 'jean.rakoto@example.com',
        'message' => 'Bonjour.',
    ])->assertSessionHas('status');

    Notification::assertSentOnDemand(
        QuickContactMessageReceived::class,
        fn (QuickContactMessageReceived $notification) => $notification->telephone === null,
    );
});

it('requires an objet, a name, a first name, a valid e-mail and a message', function () {
    $this->post('/contact/message-rapide', [])->assertInvalid(['objet', 'nom', 'prenoms', 'email', 'message']);

    $this->post('/contact/message-rapide', [
        'objet' => 'Question',
        'nom' => 'Jean',
        'prenoms' => 'Jean',
        'email' => 'not-an-email',
        'message' => 'Bonjour',
    ])->assertInvalid(['email']);
});

it('fails gracefully when no recipient address is configured', function () {
    SiteContent::where('content_key', 'contact_formulaire_email')->update(['content_value_fr' => '']);
    Notification::fake();

    $this->post('/contact/message-rapide', [
        'objet' => 'Question',
        'nom' => 'Rakoto',
        'prenoms' => 'Jean',
        'email' => 'jean.rakoto@example.com',
        'message' => 'Bonjour.',
    ])->assertSessionHas('error');

    Notification::assertNothingSent();
});
