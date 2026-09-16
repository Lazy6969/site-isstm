<?php

use App\Models\Filiere;

it('returns a valid xml sitemap including dynamic filiere pages', function () {
    $filiere = Filiere::factory()->create(['slug' => 'genie-test']);

    $response = $this->get('/sitemap.xml');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/xml');
    $response->assertSee('<urlset', false);
    $response->assertSee(route('filieres.show', $filiere), false);
});
