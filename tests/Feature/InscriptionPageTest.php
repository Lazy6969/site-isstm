<?php

use App\Models\Document;

it('renders the inscription page with no dossier file by default', function () {
    $this->get('/inscription')->assertInertia(fn ($page) => $page
        ->component('Inscription/Index')
        ->where('dossierPreinscription', null)
    );
});

it('exposes the préinscription dossier file once an admin has uploaded one', function () {
    $document = Document::factory()->create(['slug' => 'dossier_preinscription', 'category' => 'public', 'file_path' => 'storage/documents/dossier.pdf']);

    $this->get('/inscription')->assertInertia(fn ($page) => $page
        ->where('dossierPreinscription', $document->file_path)
    );
});
