<?php

use App\Models\Document;
use App\Models\User;

it('shows only public documents to guests', function () {
    Document::factory()->create(['title' => 'Fiche publique', 'category' => 'public']);
    Document::factory()->create(['title' => 'Fiche étudiant', 'category' => 'etudiant']);

    $this->get('/documents')->assertInertia(fn ($page) => $page
        ->component('Documents/Index')
        ->has('documents', 1)
        ->where('documents.0.title', 'Fiche publique')
    );
});

it('shows both public and student documents to an authenticated user', function () {
    Document::factory()->create(['category' => 'public']);
    Document::factory()->create(['category' => 'etudiant']);

    $this->actingAs(User::factory()->create())
        ->get('/documents')
        ->assertInertia(fn ($page) => $page->has('documents', 2));
});
