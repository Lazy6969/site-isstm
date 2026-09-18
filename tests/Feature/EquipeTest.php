<?php

it('renders the equipe page', function () {
    $this->get('/equipe')->assertInertia(fn ($page) => $page
        ->component('Equipe/Index')
    );
});
