<?php

use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Canevas;
use App\Models\Bibliotheque\Filiere;
use App\Models\Bibliotheque\Memoire;
use App\Models\Bibliotheque\Mention;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('lets a librarian upload a new canevas', function () {
    Storage::fake('local');
    $librarian = User::factory()->role(Role::Bibliotheque)->create();
    $annee = AnneeUniversitaire::factory()->create();

    $this->actingAs($librarian)->post('/bibliotheque/admin/canevas', [
        'titre' => 'Canevas mémoire Licence',
        'niveau' => 'Licence',
        'annee_id' => $annee->id,
        'fichier' => UploadedFile::fake()->create('canevas.docx', 500, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    ])->assertRedirect();

    $canevas = Canevas::query()->sole();
    expect($canevas->titre)->toBe('Canevas mémoire Licence');
    expect($canevas->type_fichier->value)->toBe('word');
    Storage::disk('local')->assertExists($canevas->chemin_fichier);
});

it('deletes a canevas and its stored file', function () {
    Storage::fake('local');
    $librarian = User::factory()->role(Role::Bibliotheque)->create();
    $canevas = Canevas::factory()->create(['chemin_fichier' => 'canevas/test.docx']);
    Storage::disk('local')->put($canevas->chemin_fichier, 'contenu');

    $this->actingAs($librarian)->delete("/bibliotheque/admin/canevas/{$canevas->id}")->assertRedirect();

    expect(Canevas::query()->find($canevas->id))->toBeNull();
    Storage::disk('local')->assertMissing('canevas/test.docx');
});

it('lets a librarian upload a new memoire', function () {
    Storage::fake('local');
    $librarian = User::factory()->role(Role::Bibliotheque)->create();
    $filiere = Filiere::factory()->create();
    $annee = AnneeUniversitaire::factory()->create();

    $this->actingAs($librarian)->post('/bibliotheque/admin/memoires', [
        'titre' => 'Optimisation des réseaux IoT',
        'auteur' => 'RAKOTO Jean',
        'categorie' => 'Mémoire',
        'filiere_id' => $filiere->id,
        'annee_id' => $annee->id,
        'fichier' => UploadedFile::fake()->create('memoire.pdf', 1000, 'application/pdf'),
    ])->assertRedirect();

    $memoire = Memoire::query()->sole();
    expect($memoire->auteur)->toBe('RAKOTO Jean');
    Storage::disk('local')->assertExists($memoire->chemin_fichier);
});

it('rejects a non-pdf file for a memoire upload', function () {
    $librarian = User::factory()->role(Role::Bibliotheque)->create();
    $filiere = Filiere::factory()->create();
    $annee = AnneeUniversitaire::factory()->create();

    $this->actingAs($librarian)->post('/bibliotheque/admin/memoires', [
        'titre' => 'Test',
        'auteur' => 'Auteur',
        'categorie' => 'Projet',
        'filiere_id' => $filiere->id,
        'annee_id' => $annee->id,
        'fichier' => UploadedFile::fake()->create('memoire.docx', 500, 'application/msword'),
    ])->assertSessionHasErrors('fichier');
});

it('manages mentions, filieres and annees from the reglages screen', function () {
    $librarian = User::factory()->role(Role::Bibliotheque)->create();

    $this->actingAs($librarian)->post('/bibliotheque/admin/reglages/mentions', [
        'nom' => 'Sciences et Techniques du Génie Civil',
        'abreviation' => 'STGC',
    ])->assertRedirect();
    $mention = Mention::query()->sole();

    $this->actingAs($librarian)->post('/bibliotheque/admin/reglages/filieres', [
        'nom' => 'Génie Civil',
        'abreviation' => 'GCIVIL',
        'niveau' => 'Licence',
        'mention_id' => $mention->id,
    ])->assertRedirect();
    expect(Filiere::query()->count())->toBe(1);

    $this->actingAs($librarian)->post('/bibliotheque/admin/reglages/annees', ['libelle' => '2026-2027'])->assertRedirect();
    expect(AnneeUniversitaire::query()->where('libelle', '2026-2027')->exists())->toBeTrue();
});

it('cascades the deletion of a filiere to its memoires', function () {
    $librarian = User::factory()->role(Role::Bibliotheque)->create();
    $filiere = Filiere::factory()->create();
    $memoire = Memoire::factory()->create(['filiere_id' => $filiere->id]);

    $this->actingAs($librarian)->delete("/bibliotheque/admin/reglages/filieres/{$filiere->id}")->assertRedirect();

    expect(Memoire::query()->find($memoire->id))->toBeNull();
});
