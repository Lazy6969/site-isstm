<?php

use App\Models\ArchiveDossier;
use App\Models\Filiere;
use App\Models\ResultatAdmission;
use App\Models\User;
use App\Role;

it('forbids a non-admin from listing archive dossiers', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/scolarite/resultats/archives')->assertForbidden();
});

it('creates a named, dated dossier from the active list\'s selected ids and files them under it', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $one = ResultatAdmission::factory()->create();
    $two = ResultatAdmission::factory()->create();
    $untouched = ResultatAdmission::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/resultats/archives', [
        'nom' => 'Promotion L1 - Juillet 2026',
        'date' => '2026-07-15',
        'ids' => [$one->id, $two->id],
    ])->assertRedirect();

    $dossier = ArchiveDossier::where('nom', 'Promotion L1 - Juillet 2026')->first();
    expect($dossier)->not->toBeNull();
    expect($dossier->date->toDateString())->toBe('2026-07-15');
    expect($one->refresh()->archive_dossier_id)->toBe($dossier->id);
    expect($two->refresh()->archive_dossier_id)->toBe($dossier->id);
    expect($untouched->refresh()->archive_dossier_id)->toBeNull();
});

it('requires a name to create a dossier', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $resultat = ResultatAdmission::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/resultats/archives', [
        'nom' => '',
        'ids' => [$resultat->id],
    ])->assertSessionHasErrors('nom');

    expect($resultat->refresh()->archive_dossier_id)->toBeNull();
});

it('lists dossiers with their members, most recently dated first', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $recent = ArchiveDossier::factory()->create(['nom' => 'Récent', 'date' => '2026-07-01']);
    $older = ArchiveDossier::factory()->create(['nom' => 'Ancien', 'date' => '2024-07-01']);
    ResultatAdmission::factory()->archived($recent)->create();
    ResultatAdmission::factory()->archived($older)->create();

    $this->actingAs($admin)->get('/console/scolarite/resultats/archives')->assertInertia(fn ($page) => $page
        ->component('Admin/Resultats/Archives')
        ->has('dossiers', 2)
        ->where('dossiers.0.nom', 'Récent')
        ->where('dossiers.1.nom', 'Ancien')
        ->has('dossiers.0.resultats', 1)
    );
});

it('finds a dossier by searching a member\'s name, not just the dossier\'s own name', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $dossier = ArchiveDossier::factory()->create(['nom' => 'Promotion 2026']);
    ResultatAdmission::factory()->archived($dossier)->create(['nom' => 'RAKOTO']);
    $other = ArchiveDossier::factory()->create(['nom' => 'Promotion 2025']);
    ResultatAdmission::factory()->archived($other)->create(['nom' => 'RABE']);

    $this->actingAs($admin)->get('/console/scolarite/resultats/archives?q=RAKOTO')->assertInertia(fn ($page) => $page
        ->has('dossiers', 1)
        ->where('dossiers.0.id', $dossier->id)
    );
});

it('filters dossiers by a member\'s niveau or filière', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create();
    $match = ArchiveDossier::factory()->create();
    ResultatAdmission::factory()->archived($match)->create(['niveau' => 'M1', 'filiere_id' => $filiere->id]);
    $noMatch = ArchiveDossier::factory()->create();
    ResultatAdmission::factory()->archived($noMatch)->create(['niveau' => 'L1']);

    $this->actingAs($admin)->get("/console/scolarite/resultats/archives?niveau=M1&filiere_id={$filiere->id}")->assertInertia(fn ($page) => $page
        ->has('dossiers', 1)
        ->where('dossiers.0.id', $match->id)
    );
});

it('lets an admin rename a dossier', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $dossier = ArchiveDossier::factory()->create(['nom' => 'Ancien nom']);

    $this->actingAs($admin)->put("/console/scolarite/resultats/archives/{$dossier->id}", [
        'nom' => 'Nouveau nom',
        'date' => $dossier->date->toDateString(),
    ])->assertRedirect();

    expect($dossier->refresh()->nom)->toBe('Nouveau nom');
});

it('lets an admin delete a dossier, moving it and its members to the corbeille together', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $dossier = ArchiveDossier::factory()->create();
    $resultat = ResultatAdmission::factory()->archived($dossier)->create();

    $this->actingAs($admin)->delete("/console/scolarite/resultats/archives/{$dossier->id}")->assertRedirect();

    expect(ArchiveDossier::find($dossier->id))->toBeNull();
    expect(ArchiveDossier::onlyTrashed()->find($dossier->id))->not->toBeNull();
    expect(ResultatAdmission::find($resultat->id))->toBeNull();
    expect(ResultatAdmission::onlyTrashed()->find($resultat->id))->not->toBeNull();
});

it('lets an admin restore a dossier\'s contents back to the active list, dissolving the dossier', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $dossier = ArchiveDossier::factory()->create();
    $one = ResultatAdmission::factory()->archived($dossier)->create();
    $two = ResultatAdmission::factory()->archived($dossier)->create();

    $this->actingAs($admin)->post("/console/scolarite/resultats/archives/{$dossier->id}/restaurer")->assertRedirect();

    expect($one->refresh()->archive_dossier_id)->toBeNull();
    expect($two->refresh()->archive_dossier_id)->toBeNull();
    expect(ArchiveDossier::find($dossier->id))->toBeNull();
});

it('still lets an admin edit or delete an individual résultat inside a dossier', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $dossier = ArchiveDossier::factory()->create();
    $resultat = ResultatAdmission::factory()->archived($dossier)->create(['nom' => 'ANCIEN']);

    $this->actingAs($admin)->put("/console/scolarite/resultats/{$resultat->id}", [
        'nom' => 'ANCIEN MODIFIE',
        'prenoms' => $resultat->prenoms,
        'niveau' => $resultat->niveau,
        'filiere_id' => $resultat->filiere_id,
        'date' => null,
    ])->assertRedirect();
    expect($resultat->refresh())->nom->toBe('ANCIEN MODIFIE')->archive_dossier_id->toBe($dossier->id);

    $this->actingAs($admin)->delete("/console/scolarite/resultats/{$resultat->id}")->assertRedirect();
    expect(ResultatAdmission::find($resultat->id))->toBeNull();
});

it('exports one dossier\'s contents as Excel', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $dossier = ArchiveDossier::factory()->create(['nom' => 'Promotion 2026']);
    ResultatAdmission::factory()->archived($dossier)->create();

    $response = $this->actingAs($admin)->get("/console/scolarite/resultats/archives/{$dossier->id}/export/excel");

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

it('exports one dossier\'s contents as PDF', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $dossier = ArchiveDossier::factory()->create(['nom' => 'Promotion 2026']);
    ResultatAdmission::factory()->archived($dossier)->create();

    $response = $this->actingAs($admin)->get("/console/scolarite/resultats/archives/{$dossier->id}/export/pdf");

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toBe('application/pdf');
});
