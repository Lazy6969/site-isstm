<?php

use App\FriendRequestStatus;
use App\Models\Filiere;
use App\Models\FriendRequest;
use App\Models\Preinscription;
use App\Models\User;
use App\PreinscriptionStatus;
use App\Role;

it('forbids a user without a community role from viewing the friends hub', function () {
    $user = User::factory()->role(Role::Materiel)->create();

    $this->actingAs($user)->get('/amis')->assertForbidden();
});

it('renders the friends hub with friends, requests and suggestions', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    FriendRequest::factory()->accepted()->create(['sender_id' => $user->id, 'recipient_id' => $friend->id]);

    $sender = User::factory()->role(Role::Etudiant)->create();
    FriendRequest::factory()->create(['sender_id' => $sender->id, 'recipient_id' => $user->id]);

    $this->actingAs($user)->get('/amis')->assertInertia(fn ($page) => $page
        ->component('Amis/Index')
        ->has('friends', 1)
        ->has('received', 1)
    );
});

it('sends a friend request and notifies the recipient', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $recipient = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->post("/amis/{$recipient->id}")->assertRedirect();

    expect(FriendRequest::query()->where('sender_id', $user->id)->where('recipient_id', $recipient->id)->exists())->toBeTrue();
    expect($recipient->notifications()->first()?->data['type'] ?? null)->toBe('demande_ami');
});

it('refuses a duplicate friend request', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $recipient = User::factory()->role(Role::Etudiant)->create();
    FriendRequest::factory()->create(['sender_id' => $user->id, 'recipient_id' => $recipient->id]);

    $this->actingAs($user)->post("/amis/{$recipient->id}")->assertStatus(409);
});

it('lets the recipient accept a pending friend request and notifies the original sender', function () {
    $sender = User::factory()->role(Role::Etudiant)->create();
    $recipient = User::factory()->role(Role::Etudiant)->create();
    $friendRequest = FriendRequest::factory()->create(['sender_id' => $sender->id, 'recipient_id' => $recipient->id]);

    $this->actingAs($recipient)->post("/amis/demandes/{$friendRequest->id}/accepter")->assertRedirect();

    expect($friendRequest->refresh()->status)->toBe(FriendRequestStatus::Accepted);
    expect($sender->notifications()->first()?->data['type'] ?? null)->toBe('ami_accepte');
});

it('forbids the sender from accepting their own request', function () {
    $sender = User::factory()->role(Role::Etudiant)->create();
    $recipient = User::factory()->role(Role::Etudiant)->create();
    $friendRequest = FriendRequest::factory()->create(['sender_id' => $sender->id, 'recipient_id' => $recipient->id]);

    $this->actingAs($sender)->post("/amis/demandes/{$friendRequest->id}/accepter")->assertForbidden();
});

it('lets either side remove an accepted friendship', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $friendRequest = FriendRequest::factory()->accepted()->create(['sender_id' => $user->id, 'recipient_id' => $friend->id]);

    $this->actingAs($friend)->delete("/amis/demandes/{$friendRequest->id}")->assertRedirect();

    expect(FriendRequest::query()->find($friendRequest->id))->toBeNull();
});

it('prioritises suggestions from the same filiere', function () {
    $filiere = Filiere::factory()->create();
    $otherFiliere = Filiere::factory()->create();

    $user = User::factory()->role(Role::Etudiant)->create();
    Preinscription::factory()->create(['user_id' => $user->id, 'filiere_id' => $filiere->id, 'status' => PreinscriptionStatus::Accepte]);

    $sameFiliere = User::factory()->role(Role::Etudiant)->create();
    Preinscription::factory()->create(['user_id' => $sameFiliere->id, 'filiere_id' => $filiere->id, 'status' => PreinscriptionStatus::Accepte]);

    $otherStudent = User::factory()->role(Role::Etudiant)->create();
    Preinscription::factory()->create(['user_id' => $otherStudent->id, 'filiere_id' => $otherFiliere->id, 'status' => PreinscriptionStatus::Accepte]);

    $this->actingAs($user)->get('/amis')->assertInertia(fn ($page) => $page
        ->component('Amis/Index')
        ->where('suggestions.0.id', $sameFiliere->id)
    );
});
