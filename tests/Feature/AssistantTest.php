<?php

use App\Models\Setting;
use App\Models\SiteContent;

it('asks to type a question when the message is empty', function () {
    $this->postJson('/assistant/demander', ['message' => ''])
        ->assertOk()
        ->assertJson(['link' => null, 'link_label' => null])
        ->assertJsonStructure(['reply']);
});

it('matches a known intent and suggests its link', function () {
    $this->postJson('/assistant/demander', ['message' => "Comment faire pour s'inscrire ?"])
        ->assertOk()
        ->assertJson([
            'reply' => __('assistant.reponse_inscription'),
            'link' => route('preinscription.create'),
            'link_label' => __('assistant.lien_inscription'),
        ]);
});

it('matches an intent despite small typos and accents', function () {
    $this->postJson('/assistant/demander', ['message' => 'quelle est votre adresse pour le contct'])
        ->assertOk()
        ->assertJson([
            'reply' => __('assistant.reponse_contact'),
            'link' => route('contact'),
        ]);
});

it('falls back to the site FAQ when no intent matches', function () {
    $this->postJson('/assistant/demander', ['message' => "combien d'étudiants et d'enseignants compte l'ISSTM"])
        ->assertOk()
        ->assertJson([
            'reply' => 'Environ 2500 étudiants et 73 enseignants, permanents et vacataires, répartis dans 18 filières.',
            'link' => null,
            'link_label' => null,
        ]);
});

it('includes a link on a FAQ entry that has one', function () {
    $this->postJson('/assistant/demander', ['message' => "où trouver l'organigramme ou la grille de cursus"])
        ->assertOk()
        ->assertJson([
            'link' => route('documents.index'),
            'link_label' => __('assistant.lien_documents'),
        ]);
});

it('suggests the site search when nothing matches', function () {
    $this->postJson('/assistant/demander', ['message' => 'bibimbap croissant parapluie'])
        ->assertOk()
        ->assertJson([
            'reply' => __('assistant.reponse_inconnue'),
            'link' => route('recherche', ['q' => 'bibimbap croissant parapluie']),
            'link_label' => __('assistant.lien_recherche'),
        ]);
});

it('rejects an overly long message', function () {
    $this->postJson('/assistant/demander', ['message' => str_repeat('a', 501)])
        ->assertInvalid(['message']);
});

it('answers with the live contact details instead of a hardcoded snapshot', function () {
    SiteContent::factory()->create(['content_key' => 'contact_email', 'content_value_fr' => 'secretariat@isstm.test']);
    SiteContent::factory()->create(['content_key' => 'contact_telephone', 'content_value_fr' => '+261 00 00 000 00']);
    SiteContent::factory()->create(['content_key' => 'contact_adresse', 'content_value_fr' => 'Majunga Be, Mahajanga']);

    $this->postJson('/assistant/demander', ['message' => 'telephone ou email ?'])
        ->assertOk()
        ->assertJson([
            'reply' => __('assistant.reponse_contact_dynamique', [
                'email' => 'secretariat@isstm.test',
                'telephone' => '+261 00 00 000 00',
                'adresse' => 'Majunga Be, Mahajanga',
            ]),
        ]);
});

it('tells visitors registrations are closed instead of suggesting the form', function () {
    Setting::set('inscriptions.closed', 'true');
    Setting::set('inscriptions.closed_message', 'Les inscriptions reprendront en janvier.');

    $this->postJson('/assistant/demander', ['message' => 'comment faire ma preinscription'])
        ->assertOk()
        ->assertJson(['reply' => 'Les inscriptions reprendront en janvier.']);
});

it('mentions the real registration deadline when one is set', function () {
    SiteContent::factory()->create(['content_key' => 'inscription_date_limite', 'content_value_fr' => '2026-10-09']);

    $this->postJson('/assistant/demander', ['message' => 'comment faire ma preinscription'])
        ->assertOk()
        ->assertJson([
            'reply' => __('assistant.reponse_inscription_ouverte', ['date' => '9 octobre 2026']),
        ]);
});

it('covers topics across the whole site, not just admissions', function () {
    $cases = [
        "quelle est l'histoire de l'ISSTM" => route('historique'),
        "qui est le directeur de l'ISSTM" => route('directeur'),
        'liste des enseignants' => route('enseignants.index'),
        "qu'est ce que la bibliotheque numerique" => route('bibliotheque'),
        "je veux me reinscrire l'annee prochaine" => route('inscription-dossier.create'),
        'je suis un ancien etudiant je veux reactiver mon compte' => route('reactivation.create'),
    ];

    foreach ($cases as $message => $expectedLink) {
        $this->postJson('/assistant/demander', ['message' => $message])
            ->assertOk()
            ->assertJson(['link' => $expectedLink]);
    }
});

it('greets back a friendly visitor without pointing anywhere', function () {
    $this->postJson('/assistant/demander', ['message' => 'bonjour'])
        ->assertOk()
        ->assertJson([
            'reply' => __('assistant.reponse_salutation'),
            'link' => null,
            'link_label' => null,
        ]);
});
