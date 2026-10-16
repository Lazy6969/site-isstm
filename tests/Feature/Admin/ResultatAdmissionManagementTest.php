<?php

use App\Models\Filiere;
use App\Models\ResultatAdmission;
use App\Models\User;
use App\Role;
use App\XlsxWriter;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;

it('forbids a non-admin from listing résultats', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/scolarite/resultats')->assertForbidden();
});

it('lets an admin create a résultat', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/resultats', [
        'nom' => 'RAKOTO',
        'prenoms' => 'Jean',
        'niveau' => 'L1',
        'filiere_id' => $filiere->id,
        'date' => '2026-07-01',
    ])->assertRedirect();

    expect(ResultatAdmission::where('nom', 'RAKOTO')->first())
        ->prenoms->toBe('Jean')
        ->niveau->toBe('L1')
        ->filiere_id->toBe($filiere->id);
});

it('lets an admin update a résultat', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $resultat = ResultatAdmission::factory()->create(['nom' => 'RAKOTO']);

    $this->actingAs($admin)->put("/console/scolarite/resultats/{$resultat->id}", [
        'nom' => 'RAKOTONIRINA',
        'prenoms' => $resultat->prenoms,
        'niveau' => $resultat->niveau,
        'filiere_id' => $resultat->filiere_id,
        'date' => null,
    ])->assertRedirect();

    expect($resultat->refresh()->nom)->toBe('RAKOTONIRINA');
});

it('lets an admin soft-delete a résultat', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $resultat = ResultatAdmission::factory()->create();

    $this->actingAs($admin)->delete("/console/scolarite/resultats/{$resultat->id}")->assertRedirect();

    expect(ResultatAdmission::find($resultat->id))->toBeNull();
    expect(ResultatAdmission::onlyTrashed()->find($resultat->id))->not->toBeNull();
});

it('lets an admin delete every résultat at once, active and archived alike', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $active = ResultatAdmission::factory()->create();
    $archived = ResultatAdmission::factory()->archived()->create();

    $this->actingAs($admin)->delete('/console/scolarite/resultats')->assertRedirect();

    expect(ResultatAdmission::count())->toBe(0);
    expect(ResultatAdmission::onlyTrashed()->whereIn('id', [$active->id, $archived->id])->count())->toBe(2);
});

it('only lists résultats with no dossier on the active page', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $active = ResultatAdmission::factory()->create(['nom' => 'ACTIF']);
    ResultatAdmission::factory()->archived()->create(['nom' => 'ARCHIVE']);

    $this->actingAs($admin)->get('/console/scolarite/resultats')->assertInertia(fn ($page) => $page
        ->component('Admin/Resultats/Index')
        ->has('resultats', 1)
        ->where('resultats.0.nom', $active->nom)
    );
});

it('imports résultats from an uploaded .xlsx file, matching the filière by name', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['nom_fr' => 'Informatique']);

    // Built with the app's own XlsxWriter (the same inlineStr format a
    // re-imported export would carry) rather than a hand-crafted binary, so
    // the test exercises a real, valid .xlsx round-trip.
    $response = XlsxWriter::download('resultats.xlsx', 'Résultats', ['Nom', 'Prénom(s)', 'Niveau', 'Filière', 'Année'], [
        ['RAKOTO', 'Jean', 'L1', 'Informatique', '2026'],
        ['RABE', 'Marie', 'L2', '', ''],
        ['', '', '', '', ''],
    ]);
    $path = $response->getFile()->getPathname();
    $file = new UploadedFile($path, 'resultats.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

    $this->actingAs($admin)->post('/console/scolarite/resultats/import', ['file' => $file])->assertRedirect();

    $rakoto = ResultatAdmission::where('nom', 'RAKOTO')->first();
    expect($rakoto->prenoms)->toBe('Jean');
    expect($rakoto->niveau)->toBe('L1');
    expect($rakoto->filiere_id)->toBe($filiere->id);
    expect($rakoto->date->toDateString())->toBe('2026-01-01');
    expect(ResultatAdmission::where('nom', 'RABE')->first())->filiere_id->toBeNull();
    expect(ResultatAdmission::count())->toBe(2);
});

it('imports résultats from an uploaded .csv file, reading a plain 4-digit year', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $csv = "Nom;Prénom(s);Niveau;Filière;Année\nRASOA;Hery;M1;;2026\n";
    $file = UploadedFile::fake()->createWithContent('resultats.csv', $csv);

    $this->actingAs($admin)->post('/console/scolarite/resultats/import', ['file' => $file])->assertRedirect();

    $rasoa = ResultatAdmission::where('nom', 'RASOA')->first();
    expect($rasoa->niveau)->toBe('M1');
    expect($rasoa->date->toDateString())->toBe('2026-01-01');
});

it('still accepts a full DD/MM/YYYY date typed into the Année column, reduced to its year', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $csv = "Nom;Prénom(s);Niveau;Filière;Année\nTAHINA;Soa;L2;;15/08/2026\n";
    $file = UploadedFile::fake()->createWithContent('resultats.csv', $csv);

    $this->actingAs($admin)->post('/console/scolarite/resultats/import', ['file' => $file])->assertRedirect();

    expect(ResultatAdmission::where('nom', 'TAHINA')->first()->date->toDateString())->toBe('2026-01-01');
});

it('imports a date typed directly into an Excel date cell, which reads back as a day-count serial', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    // Excel stores an actual (not typed-as-text) date as the number of days
    // since 1899-12-30 — XlsxReader has no access to the cell's display
    // format, so this is what parseDate() has to recognize. A CSV digit
    // string exercises the exact same code path as a real .xlsx serial cell.
    // 46000 (5 digits) is unambiguously a serial, not a typed year.
    $csv = "Nom;Prénom(s);Niveau;Filière;Année\nANDRY;Lova;L3;;46000\n";
    $file = UploadedFile::fake()->createWithContent('resultats.csv', $csv);

    $this->actingAs($admin)->post('/console/scolarite/resultats/import', ['file' => $file])->assertRedirect();

    $expected = Carbon::create(1899, 12, 30)->addDays(46000)->startOfYear()->toDateString();
    expect(ResultatAdmission::where('nom', 'ANDRY')->first()->date->toDateString())->toBe($expected);
});

it('shows only non-archived résultats on the public page', function () {
    $published = ResultatAdmission::factory()->create(['nom' => 'PUBLIE']);
    ResultatAdmission::factory()->archived()->create(['nom' => 'ARCHIVE']);

    $this->get('/resultats')->assertInertia(fn ($page) => $page
        ->component('Resultats/Index')
        ->has('resultats', 1)
        ->where('resultats.0.nom', $published->nom)
    );
});
