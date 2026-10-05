<?php

use App\Models\Setting;

it('exposes no hero sparkle color override by default', function () {
    $this->get('/')->assertInertia(fn ($page) => $page
        ->component('Home')
        ->where('heroSparkleColor', null)
    );
});

it('exposes the custom hero sparkle color once set', function () {
    Setting::set('appearance.hero_sparkle_color', '#ff00ff');

    $this->get('/')->assertInertia(fn ($page) => $page
        ->component('Home')
        ->where('heroSparkleColor', '#ff00ff')
    );
});
