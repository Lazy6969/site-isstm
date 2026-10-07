<?php

it('renders the FAQ page', function () {
    $this->get('/faq')->assertInertia(fn ($page) => $page
        ->component('Faq')
    );
});
