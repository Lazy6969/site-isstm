<?php

use App\Models\SiteContent;
use App\SiteContentType;

it('renders the contact page', function () {
    $this->get('/contact')->assertInertia(fn ($page) => $page
        ->component('Contact/Index')
    );
});

it('exposes each campus map\'s GPS coordinates to the page', function () {
    SiteContent::factory()->create([
        'content_key' => 'contact_carte_principale_coords',
        'type' => SiteContentType::Url,
        'content_value_fr' => '-15.702528,46.353861',
        'content_value_en' => '-15.702528,46.353861',
        'content_value_mg' => '-15.702528,46.353861',
    ]);

    $this->get('/contact')->assertInertia(fn ($page) => $page
        ->component('Contact/Index')
        ->where('content.contact_carte_principale_coords', '-15.702528,46.353861')
    );
});
