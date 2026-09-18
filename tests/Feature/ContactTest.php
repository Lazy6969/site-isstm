<?php

it('renders the contact page', function () {
    $this->get('/contact')->assertInertia(fn ($page) => $page
        ->component('Contact/Index')
    );
});
