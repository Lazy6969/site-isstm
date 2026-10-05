<?php

use App\Models\SiteContent;
use App\SiteContentType;

it('renders the library page for anyone, with no link configured by default', function () {
    SiteContent::factory()->create([
        'content_key' => 'bibliotheque_lien',
        'type' => SiteContentType::Url,
        'content_value_fr' => '',
        'content_value_en' => '',
        'content_value_mg' => '',
    ]);

    $this->get('/bibliotheque')->assertInertia(fn ($page) => $page
        ->component('Bibliotheque/Accueil')
        ->where('content.bibliotheque_lien', '')
    );
});

it('exposes whatever external link a super admin has configured', function () {
    SiteContent::factory()->create([
        'content_key' => 'bibliotheque_lien',
        'type' => SiteContentType::Url,
        'content_value_fr' => 'https://bibliotheque.example.com',
        'content_value_en' => 'https://bibliotheque.example.com',
        'content_value_mg' => 'https://bibliotheque.example.com',
    ]);

    $this->get('/bibliotheque')->assertInertia(fn ($page) => $page
        ->component('Bibliotheque/Accueil')
        ->where('content.bibliotheque_lien', 'https://bibliotheque.example.com')
    );
});

it('exposes each slide photo and caption set by a super admin', function () {
    SiteContent::factory()->create([
        'content_key' => 'bibliotheque_slide1_image_path',
        'type' => SiteContentType::Image,
        'content_value_fr' => 'storage/site-content/photo.jpg',
        'content_value_en' => 'storage/site-content/photo.jpg',
        'content_value_mg' => 'storage/site-content/photo.jpg',
    ]);
    SiteContent::factory()->create([
        'content_key' => 'bibliotheque_slide1_texte',
        'type' => SiteContentType::Text,
        'content_value_fr' => 'Légende en français',
        'content_value_en' => 'Caption in English',
        'content_value_mg' => 'Soratra am-pandanian-teny malagasy',
    ]);

    $this->get('/bibliotheque')->assertInertia(fn ($page) => $page
        ->component('Bibliotheque/Accueil')
        ->where('content.bibliotheque_slide1_image_path', 'storage/site-content/photo.jpg')
        ->where('content.bibliotheque_slide1_texte', 'Légende en français')
    );
});
