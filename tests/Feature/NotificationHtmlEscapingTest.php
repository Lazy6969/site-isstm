<?php

use App\Models\Candidat;
use App\Models\User;
use App\Notifications\AccountReactivated;
use App\Notifications\AccountReactivationRejected;
use App\Notifications\PreinscriptionAccepted;
use App\Notifications\PreinscriptionReceived;

/**
 * emails.trilingual (used by these 4 notifications) renders each "line" as
 * raw HTML ({!! $line !!}) so a deliberate <strong>numéro de dossier</strong>
 * survives — but that same raw channel used to carry $notifiable->name
 * (a candidate-chosen, unvalidated free-text field) unescaped too, letting a
 * registration like `name = '<a href="https://evil.test">...'` inject real
 * markup into an otherwise-trusted ISSTM e-mail. Each toMail() now escapes
 * that interpolation at the source; these tests read the MailMessage's raw
 * view data directly (no need to render Blade/send mail) to confirm the
 * malicious markup survives only as inert, escaped text.
 */
$maliciousName = '<img src=x onerror=alert(1)>Jean';
$escaped = e($maliciousName);

it('escapes the candidate name in AccountReactivated', function () use ($maliciousName, $escaped) {
    $user = User::factory()->make(['name' => $maliciousName]);
    $mail = (new AccountReactivated)->toMail($user);

    expect($mail->viewData['sections']['fr']['lines'][0])->toContain($escaped)->not->toContain('<img');
});

it('escapes the candidate name and admin motif in AccountReactivationRejected', function () use ($maliciousName, $escaped) {
    $user = User::factory()->make(['name' => $maliciousName]);
    $mail = (new AccountReactivationRejected($maliciousName))->toMail($user);

    expect($mail->viewData['sections']['fr']['lines'][0])->toContain($escaped)->not->toContain('<img');
    expect($mail->viewData['sections']['fr']['lines'][2])->toContain($escaped)->not->toContain('<img');
});

it('escapes the candidate name in PreinscriptionAccepted', function () use ($maliciousName, $escaped) {
    $user = User::factory()->make(['name' => $maliciousName]);
    $mail = (new PreinscriptionAccepted('PI-2026-00001'))->toMail($user);

    expect($mail->viewData['sections']['fr']['lines'][0])->toContain($escaped)->not->toContain('<img');
    // The server-generated tracking number keeps its deliberate <strong> tag.
    expect($mail->viewData['sections']['fr']['lines'][1])->toContain('<strong>PI-2026-00001</strong>');
});

it('escapes the candidate name in PreinscriptionReceived', function () use ($maliciousName, $escaped) {
    $candidat = Candidat::factory()->make(['numero_dossier' => 'PI-2026-00001']);
    $user = User::factory()->make(['name' => $maliciousName]);

    $mail = (new PreinscriptionReceived($candidat))->toMail($user);

    expect($mail->viewData['sections']['fr']['lines'][0])->toContain($escaped)->not->toContain('<img');
});
