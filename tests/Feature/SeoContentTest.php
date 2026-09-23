<?php

use App\Models\SiteContent;

it('exposes a page\'s SEO title and description through the shared content prop', function () {
    SiteContent::factory()->create([
        'content_key' => 'accueil_seo_titre',
        'content_value_fr' => 'ISSTM Mahajanga — Accueil',
    ]);
    SiteContent::factory()->create([
        'content_key' => 'accueil_seo_description',
        'content_value_fr' => 'Institut Supérieur des Sciences et Technologies de Mahajanga.',
    ]);

    $this->get('/')->assertInertia(fn ($page) => $page
        ->where('content.accueil_seo_titre', 'ISSTM Mahajanga — Accueil')
        ->where('content.accueil_seo_description', 'Institut Supérieur des Sciences et Technologies de Mahajanga.')
    );
});
