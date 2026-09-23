<?php

it('renders the formations page', function () {
    $this->get('/formations')->assertInertia(fn ($page) => $page->component('Formations/Index'));
});
