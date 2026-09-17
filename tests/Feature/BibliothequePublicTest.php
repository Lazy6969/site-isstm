<?php

use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Canevas;
use App\Models\Bibliotheque\Memoire;
use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

it('writes bibliotheque models to the dedicated connection, not the default one', function () {
    $annee = AnneeUniversitaire::factory()->create();

    expect($annee->getConnectionName())->toBe('bibliotheque');
    $this->assertDatabaseHas('annees_universitaires', ['id' => $annee->id], 'bibliotheque');
    expect(Schema::hasTable('annees_universitaires'))->toBeFalse();
});

it('requires authentication to browse the library', function () {
    $this->get('/bibliotheque')->assertRedirect('/login');
});

it('lists canevas filtered by niveau', function () {
    $user = User::factory()->create();
    $licence = Canevas::factory()->create(['niveau' => 'Licence']);
    Canevas::factory()->create(['niveau' => 'Master']);

    $this->actingAs($user)->get('/bibliotheque/canevas?niveau=Licence')->assertInertia(fn ($page) => $page
        ->component('Bibliotheque/Canevas/Index')
        ->has('canevas', 1)
        ->where('canevas.0.id', $licence->id)
    );
});

it('downloads a canevas file for any authenticated user', function () {
    Storage::fake('local');
    $user = User::factory()->create();
    $canevas = Canevas::factory()->create();
    Storage::disk('local')->put($canevas->chemin_fichier, 'contenu du fichier');

    $this->actingAs($user)->get("/bibliotheque/canevas/{$canevas->id}/telecharger")->assertOk();
});

it('generates a session token when opening the memoire viewer', function () {
    $user = User::factory()->create();
    $memoire = Memoire::factory()->create();

    $response = $this->actingAs($user)->get("/bibliotheque/memoires/{$memoire->id}/consulter");

    $response->assertInertia(fn ($page) => $page->component('Bibliotheque/Memoires/Consulter')->has('token'));
    expect(session()->has("memoire_token_{$memoire->id}"))->toBeTrue();
});

it('refuses to stream a memoire pdf without a valid token', function () {
    $user = User::factory()->create();
    $memoire = Memoire::factory()->create();

    $this->actingAs($user)
        ->get("/bibliotheque/memoires/{$memoire->id}/flux", ['X-Requete-Visionneuse' => '1'])
        ->assertForbidden();
});

it('streams the memoire pdf when the viewer token and header are valid', function () {
    Storage::fake('local');
    $user = User::factory()->create();
    $memoire = Memoire::factory()->create();
    Storage::disk('local')->put($memoire->chemin_fichier, '%PDF-1.4 contenu');

    $viewerResponse = $this->actingAs($user)->get("/bibliotheque/memoires/{$memoire->id}/consulter");
    $token = $viewerResponse->viewData('page')['props']['token'];

    $this->actingAs($user)
        ->get("/bibliotheque/memoires/{$memoire->id}/flux?token={$token}", ['X-Requete-Visionneuse' => '1'])
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

it('refuses a stream request once the token has expired', function () {
    Storage::fake('local');
    $user = User::factory()->create();
    $memoire = Memoire::factory()->create();
    Storage::disk('local')->put($memoire->chemin_fichier, '%PDF-1.4 contenu');

    $this->actingAs($user)->get("/bibliotheque/memoires/{$memoire->id}/consulter");
    session()->put("memoire_token_{$memoire->id}.expire", now()->subMinute()->timestamp);
    $token = session("memoire_token_{$memoire->id}.token");

    $this->actingAs($user)
        ->get("/bibliotheque/memoires/{$memoire->id}/flux?token={$token}", ['X-Requete-Visionneuse' => '1'])
        ->assertForbidden();
});

it('forbids a regular student from reaching the library back office', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->get('/bibliotheque/admin')->assertForbidden();
});

it('lets an admin reach the library back office as a session bridge', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/bibliotheque/admin')->assertOk();
});

it('lets the dedicated bibliotheque role reach the back office', function () {
    $librarian = User::factory()->role(Role::Bibliotheque)->create();

    $this->actingAs($librarian)->get('/bibliotheque/admin')->assertOk();
});
