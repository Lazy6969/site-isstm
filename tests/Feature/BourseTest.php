<?php

use App\Models\SiteContent;
use App\SiteContentType;

it('renders the scholarship page with the 3rd option disabled by default (no link configured)', function () {
    SiteContent::factory()->create([
        'content_key' => 'bourse_lien3_href',
        'type' => SiteContentType::Url,
        'content_value_fr' => '',
        'content_value_en' => '',
        'content_value_mg' => '',
    ]);

    $this->get('/bourse')->assertInertia(fn ($page) => $page
        ->component('Bourse')
        ->where('content.bourse_lien3_href', '')
    );
});

it('exposes whatever external link a super admin has configured for the 3rd option', function () {
    SiteContent::factory()->create([
        'content_key' => 'bourse_lien3_href',
        'type' => SiteContentType::Url,
        'content_value_fr' => 'https://example.com/bourse-regionale',
        'content_value_en' => 'https://example.com/bourse-regionale',
        'content_value_mg' => 'https://example.com/bourse-regionale',
    ]);

    $this->get('/bourse')->assertInertia(fn ($page) => $page
        ->component('Bourse')
        ->where('content.bourse_lien3_href', 'https://example.com/bourse-regionale')
    );
});
