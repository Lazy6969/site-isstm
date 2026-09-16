<?php

it('renders the static informational pages', function (string $uri, string $component) {
    $this->get($uri)->assertInertia(fn ($page) => $page->component($component));
})->with([
    ['bourse', 'Bourse'],
    ['vie-etudiante', 'VieEtudiante'],
    ['associations', 'Associations'],
]);
