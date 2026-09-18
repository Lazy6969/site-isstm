<?php

it('renders the directeur page', function () {
    $this->get('/mot-du-directeur')->assertInertia(fn ($page) => $page
        ->component('Directeur/Index')
    );
});
