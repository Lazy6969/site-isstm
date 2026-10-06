<?php

it('renders the registration help page even with no video uploaded yet', function () {
    $this->get('/aide-inscription')->assertInertia(fn ($page) => $page
        ->component('Aide/Inscription')
    );
});
