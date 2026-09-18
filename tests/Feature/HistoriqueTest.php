<?php

it('renders the historique page', function () {
    $this->get('/historique')->assertInertia(fn ($page) => $page
        ->component('Historique/Index')
    );
});
