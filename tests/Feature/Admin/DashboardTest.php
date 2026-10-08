<?php

use App\Models\ActionArchive;
use App\Models\Candidat;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\GalleryAlbum;
use App\Models\Inscription;
use App\Models\NewsArticle;
use App\Models\Partenaire;
use App\Models\ReactivationRequest;
use App\Models\Teacher;
use App\Models\Testimonial;
use App\Models\User;
use App\NewsStatus;
use App\PreinscriptionStatus;
use App\ReactivationStatus;
use App\Role;
use App\StatutInscription;
use Illuminate\Support\Facades\DB;

it('forbids a non-admin from viewing the dashboard', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/dashboard')->assertForbidden();
});

it('shows aggregate stats to an admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $classe = Classe::factory()->create();
    $etudiants = Etudiant::factory()->count(2)->create(['classe_id' => $classe->id]);
    Candidat::factory()->create(['status' => PreinscriptionStatus::Soumis]);
    Inscription::factory()->create([
        'etudiant_id' => $etudiants->first()->id,
        'classe_id' => $classe->id,
        'statut' => StatutInscription::Validee,
    ]);

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->component('Admin/Dashboard')
        ->where('stats.etudiants', 2)
        ->where('stats.classes', 1)
        ->where('stats.preinscriptions_en_attente', 1)
        ->where('stats.inscriptions_validees', 1)
    );
});

it('shows content stats to an admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Filiere::factory()->count(2)->create();
    Teacher::factory()->create();
    NewsArticle::factory()->create(['status' => NewsStatus::Publie]);
    NewsArticle::factory()->create(['status' => NewsStatus::Brouillon]);
    GalleryAlbum::factory()->create();
    Testimonial::factory()->create();
    Partenaire::factory()->count(3)->create();

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->component('Admin/Dashboard')
        ->where('contentStats.filieres', 2)
        ->where('contentStats.enseignants', 1)
        ->where('contentStats.actualites_publiees', 1)
        ->where('contentStats.albums_galerie', 1)
        ->where('contentStats.temoignages', 1)
        ->where('contentStats.partenaires', 3)
    );
});

it('aggregates a 6-month sparkline trend for every stat card', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Etudiant::factory()->count(2)->create(['created_at' => now()]);
    Etudiant::factory()->create(['created_at' => now()->subMonths(2)]);

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->component('Admin/Dashboard')
        ->has('trends.etudiants', 6)
        ->where('trends.etudiants.5', 2)
        ->where('trends.etudiants.3', 1)
        ->has('trends.classes', 6)
        ->has('trends.preinscriptions_en_attente', 6)
        ->has('trends.inscriptions_validees', 6)
        ->has('trends.filieres', 6)
        ->has('trends.enseignants', 6)
        ->has('trends.actualites_publiees', 6)
        ->has('trends.albums_galerie', 6)
        ->has('trends.temoignages', 6)
        ->has('trends.partenaires', 6)
    );
});

it('aggregates chart and activity data for an admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['nom_fr' => 'Informatique']);
    $classe = Classe::factory()->create(['filiere_id' => $filiere->id, 'niveau' => 'L1']);
    $etudiant = Etudiant::factory()->create(['classe_id' => $classe->id, 'created_at' => now()->subMinutes(10)]);
    Candidat::factory()->create(['created_at' => now()]);

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->component('Admin/Dashboard')
        ->has('preinscriptionsParMois', 6)
        ->where('preinscriptionsParMois.5.total', 1)
        ->where('etudiantsParNiveau.0', ['niveau' => 'L1', 'total' => 1])
        ->where('etudiantsParFiliere.0', ['filiere' => 'Informatique', 'total' => 1])
        ->has('activiteRecente', 2)
        ->where('activiteRecente.0.type', 'preinscription')
        ->where('activiteRecente.1.type', 'etudiant')
        ->where('activiteRecente.1.subject', $etudiant->user->name)
    );
});

it('counts what is waiting for a decision in each queue', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    Candidat::factory()->create(['status' => PreinscriptionStatus::Soumis]);
    Candidat::factory()->create(['status' => PreinscriptionStatus::EnExamen]);
    Candidat::factory()->create(['status' => PreinscriptionStatus::Brouillon]);
    Candidat::factory()->create(['status' => PreinscriptionStatus::Accepte]);
    Inscription::factory()->create(['type' => 'reinscription', 'statut' => StatutInscription::EnAttente]);
    Inscription::factory()->create(['type' => 'reinscription', 'statut' => StatutInscription::Validee]);
    ReactivationRequest::factory()->create(['status' => ReactivationStatus::EnAttente]);
    ReactivationRequest::factory()->create(['status' => ReactivationStatus::Refusee]);
    NewsArticle::factory()->create(['status' => NewsStatus::EnAttente]);
    NewsArticle::factory()->create(['status' => NewsStatus::Publie]);

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->has('aTraiter', 4)
        ->where('aTraiter.0', ['key' => 'preinscriptions', 'count' => 2, 'href' => '/console/preinscriptions', 'permission' => 'preinscriptions.manage'])
        ->where('aTraiter.1.count', 1)
        ->where('aTraiter.2.count', 1)
        ->where('aTraiter.3.count', 1)
    );
});

it('reports empty queues as zero rather than hiding them', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->where('aTraiter.0.count', 0)
        ->where('aTraiter.1.count', 0)
        ->where('aTraiter.2.count', 0)
        ->where('aTraiter.3.count', 0)
    );
});

it('gives every recent activity a key built from its dossier', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $candidat = Candidat::factory()->create(['created_at' => now()]);

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->where('activiteRecente.0.key', "preinscription-{$candidat->id}")
        ->where('activitesMasquees', 0)
    );
});

it('hides a recent activity for the account that removed it, without touching the dossier', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $other = User::factory()->role(Role::Admin)->create();
    $candidat = Candidat::factory()->create(['created_at' => now()]);

    $this->actingAs($admin)->post('/console/dashboard/activites/masquer', ['key' => "preinscription-{$candidat->id}"])->assertRedirect();

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->has('activiteRecente', 0)
        ->where('activitesMasquees', 1)
    );
    $this->actingAs($other)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->has('activiteRecente', 1)
        ->where('activitesMasquees', 0)
    );
    expect(Candidat::find($candidat->id))->not->toBeNull();
});

it('keeps the feed full by bringing older activities up when one is removed', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $newest = Candidat::factory()->create(['created_at' => now()]);
    Candidat::factory()->count(2)->create(['created_at' => now()->subHour()]);

    $this->actingAs($admin)->post('/console/dashboard/activites/masquer', ['key' => "preinscription-{$newest->id}"]);

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page->has('activiteRecente', 2));
});

it('hides the same activity only once and shows everything again on request', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $candidat = Candidat::factory()->create(['created_at' => now()]);

    foreach (range(1, 2) as $_) {
        $this->actingAs($admin)->post('/console/dashboard/activites/masquer', ['key' => "preinscription-{$candidat->id}"])->assertRedirect();
    }
    expect(DB::table('dismissed_activities')->where('user_id', $admin->id)->count())->toBe(1);

    $this->actingAs($admin)->delete('/console/dashboard/activites/masquees')->assertRedirect();

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->has('activiteRecente', 1)
        ->where('activitesMasquees', 0)
    );
});

it('rejects a malformed activity key', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/dashboard/activites/masquer', ['key' => 'etudiant-1; drop table users'])->assertSessionHasErrors('key');
    $this->actingAs($admin)->post('/console/dashboard/activites/masquer', ['key' => 'inconnu-3'])->assertSessionHasErrors('key');
    expect(DB::table('dismissed_activities')->count())->toBe(0);
});

it('does not let a non-admin hide dashboard activities', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->post('/console/dashboard/activites/masquer', ['key' => 'etudiant-1'])->assertForbidden();
});

it('does not record hiding an activity in the action archive', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $candidat = Candidat::factory()->create();
    $before = ActionArchive::count();

    $this->actingAs($admin)->post('/console/dashboard/activites/masquer', ['key' => "preinscription-{$candidat->id}"]);
    $this->actingAs($admin)->delete('/console/dashboard/activites/masquees');

    expect(ActionArchive::count())->toBe($before);
});
