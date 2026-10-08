<?php

use App\Models\Candidat;
use App\Models\Setting;
use App\Models\User;
use App\PreinscriptionStatus;
use App\Role;

it('redirects an already-enrolled student away from the preinscription form', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/preinscription')
        ->assertRedirect(route('rejoindre'))
        ->assertSessionHas('status');
});

it('redirects an active student away from the reactivation form', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create(['is_active' => true]);

    $this->actingAs($etudiant)->get('/ancien-etudiant')
        ->assertRedirect(route('rejoindre'))
        ->assertSessionHas('status');
});

it('still lets an inactive student reach the reactivation form', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create(['is_active' => false]);

    $this->actingAs($etudiant)->get('/ancien-etudiant')->assertInertia(fn ($page) => $page
        ->component('AncienEtudiant/Verifier')
    );
});

it('blocks a brand-new candidate from the preinscription form once inscriptions are closed', function () {
    Setting::set('inscriptions.closed', 'true');
    Setting::set('inscriptions.closed_message', 'Fermé pour le moment.');

    $this->get('/preinscription')
        ->assertRedirect(route('rejoindre'))
        ->assertSessionHas('status', 'Fermé pour le moment.');
});

it('still lets a candidate resume their draft once inscriptions are closed', function () {
    Setting::set('inscriptions.closed', 'true');
    $user = User::factory()->create();
    Candidat::factory()->create(['user_id' => $user->id, 'status' => PreinscriptionStatus::Brouillon]);

    $this->actingAs($user)->get('/preinscription')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Create')
    );
});

it('blocks the reactivation form once inscriptions are closed', function () {
    Setting::set('inscriptions.closed', 'true');

    $this->get('/ancien-etudiant')->assertRedirect(route('rejoindre'));
});

it('leaves both forms open when inscriptions are not closed', function () {
    $this->get('/preinscription')->assertInertia(fn ($page) => $page->component('Preinscription/Create'));
    $this->get('/ancien-etudiant')->assertInertia(fn ($page) => $page->component('AncienEtudiant/Verifier'));
});
