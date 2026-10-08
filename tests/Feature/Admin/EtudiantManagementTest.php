<?php

use App\Models\Candidat;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\Inscription;
use App\Models\User;
use App\Role;
use App\StatutEtudiant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

it('forbids a non-admin from listing étudiants', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/scolarite/etudiants')->assertForbidden();
});

it('lets an admin create a dossier étudiant for a student user', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $studentUser = User::factory()->role(Role::Etudiant)->create();
    $classe = Classe::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/etudiants', [
        'user_id' => $studentUser->id,
        'classe_id' => $classe->id,
        'matricule' => 'ISSTM-2025-001',
    ])->assertRedirect();

    expect(Etudiant::where('user_id', $studentUser->id)->exists())->toBeTrue();
});

it('refuses to create a dossier for a user who is not an étudiant', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $teacherUser = User::factory()->role(Role::Enseignant)->create();

    $this->actingAs($admin)->post('/console/scolarite/etudiants', [
        'user_id' => $teacherUser->id,
        'matricule' => 'ISSTM-2025-002',
    ])->assertSessionHasErrors('user_id');
});

it('refuses to create a second dossier for the same user', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/etudiants', [
        'user_id' => $etudiant->user_id,
        'matricule' => 'ISSTM-2025-003',
    ])->assertSessionHasErrors('user_id');
});

it('shows the full dossier of an étudiant', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();

    $this->actingAs($admin)->get("/console/scolarite/etudiants/{$etudiant->id}")
        ->assertInertia(fn ($page) => $page->where('etudiant.id', $etudiant->id));
});

it('lets an admin update a dossier étudiant', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();
    $nouvelleClasse = Classe::factory()->create();

    $this->actingAs($admin)->put("/console/scolarite/etudiants/{$etudiant->id}", [
        'classe_id' => $nouvelleClasse->id,
        'matricule' => $etudiant->matricule,
        'statut' => StatutEtudiant::Suspendu->value,
        'telephone' => '0341112233',
        'adresse' => 'Nouvelle adresse, Mahajanga',
    ])->assertRedirect();

    $etudiant->refresh();
    expect($etudiant->classe_id)->toBe($nouvelleClasse->id);
    expect($etudiant->statut)->toBe(StatutEtudiant::Suspendu);
    expect($etudiant->telephone)->toBe('0341112233');
    expect($etudiant->adresse)->toBe('Nouvelle adresse, Mahajanga');
    expect($etudiant->user->fresh()->is_active)->toBeFalse();
});

it('also logs out the étudiant immediately when the edit form suspends their dossier', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create(['statut' => StatutEtudiant::Actif]);

    DB::table('sessions')->insert([
        'id' => Str::random(40),
        'user_id' => $etudiant->user_id,
        'payload' => 'x',
        'last_activity' => now()->timestamp,
    ]);

    $this->actingAs($admin)->put("/console/scolarite/etudiants/{$etudiant->id}", [
        'matricule' => $etudiant->matricule,
        'statut' => StatutEtudiant::Suspendu->value,
    ])->assertRedirect();

    expect(DB::table('sessions')->where('user_id', $etudiant->user_id)->exists())->toBeFalse();
});

it('suspends the linked account when an admin pauses an active étudiant', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create(['statut' => StatutEtudiant::Actif]);

    $this->actingAs($admin)
        ->post("/console/scolarite/etudiants/{$etudiant->id}/pause")
        ->assertRedirect();

    $etudiant->refresh();
    expect($etudiant->statut)->toBe(StatutEtudiant::Suspendu);
    expect($etudiant->user->fresh()->is_active)->toBeFalse();
});

it('deletes the étudiant\'s active sessions when an admin pauses the account, forcing an immediate logout', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create(['statut' => StatutEtudiant::Actif]);

    DB::table('sessions')->insert([
        'id' => Str::random(40),
        'user_id' => $etudiant->user_id,
        'payload' => 'x',
        'last_activity' => now()->timestamp,
    ]);

    $this->actingAs($admin)
        ->post("/console/scolarite/etudiants/{$etudiant->id}/pause")
        ->assertRedirect();

    expect(DB::table('sessions')->where('user_id', $etudiant->user_id)->exists())->toBeFalse();
});

it('reactivates the linked account when an admin pauses a suspended étudiant again', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create(['statut' => StatutEtudiant::Suspendu]);
    $etudiant->user->forceFill(['is_active' => false])->save();

    $this->actingAs($admin)
        ->post("/console/scolarite/etudiants/{$etudiant->id}/pause")
        ->assertRedirect();

    $etudiant->refresh();
    expect($etudiant->statut)->toBe(StatutEtudiant::Actif);
    expect($etudiant->user->fresh()->is_active)->toBeTrue();
});

it('refuses to toggle pause on a dossier that is diplômé or abandon', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create(['statut' => StatutEtudiant::Diplome]);

    $this->actingAs($admin)
        ->post("/console/scolarite/etudiants/{$etudiant->id}/pause")
        ->assertStatus(409);
});

it('forbids a non-admin from pausing an étudiant account', function () {
    $other = User::factory()->role(Role::Etudiant)->create();
    $etudiant = Etudiant::factory()->create();

    $this->actingAs($other)
        ->post("/console/scolarite/etudiants/{$etudiant->id}/pause")
        ->assertForbidden();
});

it('suspends every active étudiant at once and leaves the others untouched', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $active1 = Etudiant::factory()->create(['statut' => StatutEtudiant::Actif]);
    $active2 = Etudiant::factory()->create(['statut' => StatutEtudiant::Actif]);
    $alreadySuspendu = Etudiant::factory()->create(['statut' => StatutEtudiant::Suspendu]);
    $diplome = Etudiant::factory()->create(['statut' => StatutEtudiant::Diplome]);

    $this->actingAs($admin)
        ->post('/console/scolarite/etudiants/pause-tous')
        ->assertRedirect();

    expect($active1->fresh()->statut)->toBe(StatutEtudiant::Suspendu);
    expect($active2->fresh()->statut)->toBe(StatutEtudiant::Suspendu);
    expect($active1->user->fresh()->is_active)->toBeFalse();
    expect($active2->user->fresh()->is_active)->toBeFalse();

    expect($alreadySuspendu->fresh()->statut)->toBe(StatutEtudiant::Suspendu);
    expect($diplome->fresh()->statut)->toBe(StatutEtudiant::Diplome);
    expect($diplome->user->fresh()->is_active)->toBeTrue();
});

it('deletes every affected session when pausing all étudiant accounts at once', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $active1 = Etudiant::factory()->create(['statut' => StatutEtudiant::Actif]);
    $active2 = Etudiant::factory()->create(['statut' => StatutEtudiant::Actif]);

    foreach ([$active1, $active2] as $etudiant) {
        DB::table('sessions')->insert([
            'id' => Str::random(40),
            'user_id' => $etudiant->user_id,
            'payload' => 'x',
            'last_activity' => now()->timestamp,
        ]);
    }

    $this->actingAs($admin)->post('/console/scolarite/etudiants/pause-tous')->assertRedirect();

    expect(DB::table('sessions')->where('user_id', $active1->user_id)->exists())->toBeFalse();
    expect(DB::table('sessions')->where('user_id', $active2->user_id)->exists())->toBeFalse();
});

it('tells the admin plainly when there is nothing to pause', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Etudiant::factory()->create(['statut' => StatutEtudiant::Suspendu]);

    $this->actingAs($admin)
        ->post('/console/scolarite/etudiants/pause-tous')
        ->assertSessionHas('status', 'Aucun compte étudiant actif à mettre en pause.');
});

it('forbids a non-admin from pausing all étudiant accounts at once', function () {
    $other = User::factory()->role(Role::Etudiant)->create();
    Etudiant::factory()->create(['statut' => StatutEtudiant::Actif]);

    $this->actingAs($other)
        ->post('/console/scolarite/etudiants/pause-tous')
        ->assertForbidden();
});

it('blocks a suspended étudiant from logging in and sends them to the dedicated suspended-account page', function () {
    $etudiant = Etudiant::factory()->create(['statut' => StatutEtudiant::Suspendu]);
    $etudiant->user->forceFill(['is_active' => false])->save();

    $response = $this->from('/login')->post('/login', [
        'email' => $etudiant->user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('login.suspendu'));
});

it('renders the dedicated suspended-account page', function () {
    $this->get('/login/suspendu')->assertInertia(fn ($page) => $page
        ->component('Auth/CompteSuspendu')
    );
});

it('lets an admin delete a student account entirely, wiping the dossier and its inscriptions', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();
    $inscription = Inscription::factory()->for($etudiant)->create();
    $userId = $etudiant->user_id;

    $this->actingAs($admin)->delete("/console/scolarite/etudiants/{$etudiant->id}")
        ->assertRedirect('/console/scolarite/etudiants');

    expect(User::find($userId))->toBeNull();
    expect(Etudiant::find($etudiant->id))->toBeNull();
    expect(Inscription::find($inscription->id))->toBeNull();
});

it('blocks login once a student account has been deleted', function () {
    $etudiant = Etudiant::factory()->create();
    $email = $etudiant->user->email;

    $etudiant->user->delete();

    $this->post('/login', ['email' => $email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('forbids a non-admin from deleting a dossier étudiant', function () {
    $etudiant = Etudiant::factory()->create();
    $other = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($other)->delete("/console/scolarite/etudiants/{$etudiant->id}")->assertForbidden();

    expect(Etudiant::find($etudiant->id))->not->toBeNull();
});

/**
 * Reads the rows of an exported workbook back as plain arrays of strings.
 *
 * @return array<int, array<int, string>>
 */
function exportedRows($response): array
{
    $zip = new ZipArchive;
    expect($zip->open($response->baseResponse->getFile()->getPathname()))->toBeTrue();

    foreach (['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/worksheets/sheet1.xml'] as $part) {
        expect(simplexml_load_string($zip->getFromName($part)))->not->toBeFalse();
    }

    $sheet = new DOMDocument;
    $sheet->loadXML($zip->getFromName('xl/worksheets/sheet1.xml'));
    $zip->close();

    $rows = [];
    foreach ($sheet->getElementsByTagName('row') as $row) {
        $rows[] = array_map(fn (DOMElement $cell) => $cell->textContent, iterator_to_array($row->getElementsByTagName('c')));
    }

    return $rows;
}

it('filters the student list by filière and niveau', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $info = Filiere::factory()->create(['nom_fr' => 'Informatique']);
    $civil = Filiere::factory()->create(['nom_fr' => 'Génie civil']);
    $infoL1 = Etudiant::factory()->create(['classe_id' => Classe::factory()->create(['filiere_id' => $info->id, 'niveau' => 'L1'])->id, 'matricule' => 'A-INFO-L1']);
    Etudiant::factory()->create(['classe_id' => Classe::factory()->create(['filiere_id' => $info->id, 'niveau' => 'L2'])->id, 'matricule' => 'B-INFO-L2']);
    Etudiant::factory()->create(['classe_id' => Classe::factory()->create(['filiere_id' => $civil->id, 'niveau' => 'L1'])->id, 'matricule' => 'C-CIVIL-L1']);

    $this->actingAs($admin)->get("/console/scolarite/etudiants?filiere_id={$info->id}&niveau=L1")->assertInertia(fn ($page) => $page
        ->component('Admin/Scolarite/Etudiants/Index')
        ->has('etudiants', 1)
        ->where('etudiants.0.matricule', $infoL1->matricule)
        ->where('etudiants.0.filiere_nom', 'Informatique')
        ->where('etudiants.0.niveau_code', 'L1')
        ->where('filters.niveau', 'L1')
        ->has('filieres', 2)
        ->where('niveaux', ['L1', 'L2'])
    );
});

it('falls back to the pre-registration niveau for a student without a class', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['nom_fr' => 'Informatique']);
    $candidat = Candidat::factory()->create(['filiere_id' => $filiere->id, 'niveau' => 'M1']);
    $etudiant = Etudiant::factory()->create(['candidat_id' => $candidat->id, 'classe_id' => null]);
    Etudiant::factory()->create();

    $this->actingAs($admin)->get("/console/scolarite/etudiants?filiere_id={$filiere->id}&niveau=M1")->assertInertia(fn ($page) => $page
        ->has('etudiants', 1)
        ->where('etudiants.0.id', $etudiant->id)
        ->where('etudiants.0.niveau_code', 'M1')
    );
});

it('searches students by name, matricule or e-mail and filters by statut', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $found = Etudiant::factory()->create(['user_id' => User::factory()->role(Role::Etudiant)->create(['name' => 'Rakoto Jean'])->id]);
    Etudiant::factory()->create(['user_id' => User::factory()->role(Role::Etudiant)->create(['name' => 'Rabe Marie'])->id, 'statut' => StatutEtudiant::Diplome]);

    $this->actingAs($admin)->get('/console/scolarite/etudiants?q=rakoto')->assertInertia(fn ($page) => $page
        ->has('etudiants', 1)->where('etudiants.0.id', $found->id));
    $this->actingAs($admin)->get('/console/scolarite/etudiants?statut=diplome')->assertInertia(fn ($page) => $page
        ->has('etudiants', 1)->where('etudiants.0.statut', 'diplome'));
});

it('rejects an unknown filière or statut in the filters', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/scolarite/etudiants?filiere_id=999999')->assertSessionHasErrors('filiere_id');
    $this->actingAs($admin)->get('/console/scolarite/etudiants/export?statut=nimporte')->assertSessionHasErrors('statut');
});

it('exports the filtered students as an Excel workbook', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['code' => 'GI', 'nom_fr' => 'Génie Informatique']);
    $classe = Classe::factory()->create(['filiere_id' => $filiere->id, 'niveau' => 'L2', 'annee' => '2026']);
    $kept = Etudiant::factory()->create([
        'user_id' => User::factory()->role(Role::Etudiant)->create(['name' => 'Rakoto Jean', 'email' => 'jean@example.test'])->id,
        'classe_id' => $classe->id,
        'matricule' => 'ISSTM-2026-00007',
        'nom' => 'RAKOTO & Fils <test>',
        'prenoms' => 'Jean',
        'telephone' => '0340000000',
        'sexe' => 'M',
        'date_naissance' => '2004-05-10',
    ]);
    Etudiant::factory()->create(['classe_id' => Classe::factory()->create(['niveau' => 'L1'])->id, 'matricule' => 'ISSTM-2026-00099']);

    $response = $this->actingAs($admin)->get("/console/scolarite/etudiants/export?filiere_id={$filiere->id}&niveau=L2");

    $response->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        ->assertDownload('etudiants_GI_L2_'.now()->format('Y-m-d').'.xlsx');

    $rows = exportedRows($response);

    expect($rows)->toHaveCount(2)
        ->and($rows[0][0])->toBe('Matricule')
        ->and($rows[0])->toContain('Filière', 'Niveau', 'Statut')
        ->and($rows[1][0])->toBe('ISSTM-2026-00007')
        ->and($rows[1][1])->toBe('RAKOTO & Fils <test>')
        ->and($rows[1][2])->toBe('Jean')
        ->and($rows[1][5])->toBe('10/05/2004')
        ->and($rows[1][9])->toBe('0340000000')
        ->and($rows[1][10])->toBe('jean@example.test')
        ->and($rows[1][13])->toBe('Génie Informatique')
        ->and($rows[1][14])->toBe('L2')
        ->and($rows[1][15])->toBe('2026')
        ->and($rows[1][16])->toBe('Actif');
});

it('exports every student when no filter is set', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Etudiant::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/console/scolarite/etudiants/export');

    $response->assertOk()->assertDownload('etudiants_'.now()->format('Y-m-d').'.xlsx');
    expect(exportedRows($response))->toHaveCount(4);
});

it('forbids a non-admin from exporting students', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/scolarite/etudiants/export')->assertForbidden();
});
