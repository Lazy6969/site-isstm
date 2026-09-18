<?php

use App\Models\SiteContent;

it('defaults to the french locale', function () {
    $this->get('/')->assertInertia(fn ($page) => $page->where('locale', 'fr'));
});

it('switches the active locale and persists it in session', function () {
    $this->post('/locale/en')->assertRedirect();

    $this->get('/')->assertInertia(fn ($page) => $page->where('locale', 'en'));
});

it('rejects an unsupported locale', function () {
    $this->post('/locale/xx')->assertNotFound();
});

it('resolves site content in the active locale with a french fallback', function () {
    $item = SiteContent::factory()->create([
        'content_value_fr' => 'Texte français',
        'content_value_en' => 'English text',
        'content_value_mg' => '',
    ]);

    app()->setLocale('en');
    expect($item->localizedValue())->toBe('English text');

    app()->setLocale('mg');
    expect($item->localizedValue())->toBe('Texte français');
});
