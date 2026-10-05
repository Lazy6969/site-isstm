<?php

use App\Models\ActivityLog;
use App\Models\Candidat;
use App\Models\ClassGroup;
use App\Models\ClassGroupMember;
use App\Models\Comment;
use App\Models\Etudiant;
use App\Models\FriendRequest;
use App\Models\Inscription;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\Story;
use App\Models\User;
use App\PreinscriptionStatus;
use App\Role;
use App\StatutInscription;

it('shows the signed-in users own activity and reach on their dashboard', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    FriendRequest::factory()->accepted()->create(['sender_id' => $user->id, 'recipient_id' => $friend->id]);

    $group = ClassGroup::factory()->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $user->id]);

    $post = Post::factory()->for($user)->create();
    $post->viewedBy()->attach($friend->id);
    Reaction::create(['post_id' => $post->id, 'user_id' => $friend->id, 'type' => 'like']);
    Comment::factory()->for($post)->create();

    $story = Story::factory()->for($user)->create();
    $story->viewedBy()->attach($friend->id);

    $this->actingAs($user)->get('/tableau-de-bord')->assertInertia(fn ($page) => $page
        ->component('Dashboard/Index')
        ->where('stats.posts_count', 1)
        ->where('stats.post_views_count', 1)
        ->where('stats.reactions_received', 1)
        ->where('stats.comments_received', 1)
        ->where('stats.stories_count', 1)
        ->where('stats.story_views_count', 1)
        ->where('stats.friends_count', 1)
        ->where('stats.groups_count', 1)
    );
});

it('does not count another users posts or stories on the dashboard', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();
    Post::factory()->for($other)->create();
    Story::factory()->for($other)->create();

    $this->actingAs($user)->get('/tableau-de-bord')->assertInertia(fn ($page) => $page
        ->where('stats.posts_count', 0)
        ->where('stats.stories_count', 0)
    );
});

it('shows no dossier section and the account info for a user with no candidat or inscription history', function () {
    $user = User::factory()->role(Role::Etudiant)->create(['phone' => '0340000000']);

    $this->actingAs($user)->get('/tableau-de-bord')->assertInertia(fn ($page) => $page
        ->where('dossier', null)
        ->where('account.email', $user->email)
        ->where('account.phone', '0340000000')
    );
});

it('shows the most recent dossier as current, with a timeline since its creation', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $candidat = Candidat::factory()->create([
        'user_id' => $user->id,
        'status' => PreinscriptionStatus::Accepte,
        'numero_dossier' => 'PI-2024-00001',
        'created_at' => now()->subYears(2),
        'submitted_at' => now()->subYears(2)->addDay(),
    ]);
    ActivityLog::record('preinscription_approved', 'Dossier accepté par la scolarité', $candidat);

    $this->actingAs($user)->get('/tableau-de-bord')->assertInertia(fn ($page) => $page
        ->where('dossier.current.numero_dossier', 'PI-2024-00001')
        ->where('dossier.current.status', 'approuve')
        ->has('dossier.timeline', 3) // créé, soumis, accepté
        ->where('dossier.timeline.0.label', 'Dossier créé')
        ->where('dossier.timeline.2.label', 'Dossier accepté par la scolarité')
        ->where('dossier.archives', [])
    );
});

it('treats the latest inscription as current and older dossiers as archives', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    Candidat::factory()->create([
        'user_id' => $user->id,
        'status' => PreinscriptionStatus::Accepte,
        'created_at' => now()->subYears(2),
    ]);
    $etudiant = Etudiant::factory()->create(['user_id' => $user->id]);
    Inscription::factory()->for($etudiant)->create([
        'annee' => '2025',
        'statut' => StatutInscription::Validee,
        'numero_dossier' => 'REI-2025-00001',
        'created_at' => now()->subYear(),
    ]);
    $latest = Inscription::factory()->for($etudiant)->create([
        'annee' => '2026',
        'statut' => StatutInscription::EnAttente,
        'numero_dossier' => 'REI-2026-00001',
        'created_at' => now(),
    ]);

    $this->actingAs($user)->get('/tableau-de-bord')->assertInertia(fn ($page) => $page
        ->where('dossier.current.numero_dossier', $latest->numero_dossier)
        ->has('dossier.archives', 2)
    );
});
