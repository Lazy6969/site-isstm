<?php

use App\Models\Conversation;
use App\Models\FriendRequest;
use App\Models\Message;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('refuses to start a conversation with a non-friend', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $stranger = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->post("/messages/nouveau/{$stranger->id}")->assertStatus(422);
});

it('starts a conversation between two friends', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    FriendRequest::factory()->accepted()->create(['sender_id' => $user->id, 'recipient_id' => $friend->id]);

    $this->actingAs($user)->post("/messages/nouveau/{$friend->id}")->assertRedirect();

    expect(Conversation::query()->count())->toBe(1);
});

it('sends a message with an attachment in an existing conversation', function () {
    Storage::fake('public');
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);

    $this->actingAs($user)->post("/messages/{$conversation->id}/envoyer", [
        'body' => 'Salut !',
        'attachments' => [UploadedFile::fake()->image('photo.jpg')],
    ])->assertRedirect();

    $message = Message::query()->where('conversation_id', $conversation->id)->first();
    expect($message->body)->toBe('Salut !');
    expect($message->attachments)->toHaveCount(1);
});

it('notifies the other participant when a message is sent', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);

    $this->actingAs($user)->post("/messages/{$conversation->id}/envoyer", ['body' => 'Salut !'])->assertRedirect();

    expect($friend->notifications()->first()?->data['type'] ?? null)->toBe('nouveau_message');
    expect($user->notifications()->count())->toBe(0);
});

it('forbids a user outside the conversation from sending a message', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $outsider = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);

    $this->actingAs($outsider)->post("/messages/{$conversation->id}/envoyer", ['body' => 'salut'])->assertForbidden();
});

it('marks messages as read when the conversation is opened', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);
    $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $friend->id, 'body' => 'hello']);

    $this->actingAs($user)->get("/messages/{$conversation->id}")->assertOk();

    expect($message->refresh()->read_at)->not->toBeNull();
});

it('reports the other participant\'s online and typing status', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create(['last_activity' => now()]);
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);

    $response = $this->actingAs($user)->getJson("/messages/{$conversation->id}/statut");
    $response->assertOk()->assertJson(['online' => true, 'typing' => false]);

    $this->actingAs($friend)->postJson("/messages/{$conversation->id}/frappe")->assertOk();

    $this->actingAs($user)->getJson("/messages/{$conversation->id}/statut")
        ->assertJson(['online' => true, 'typing' => true]);
});

it('forbids checking status or pinging typing for a conversation you are not part of', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $outsider = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);

    $this->actingAs($outsider)->getJson("/messages/{$conversation->id}/statut")->assertForbidden();
    $this->actingAs($outsider)->postJson("/messages/{$conversation->id}/frappe")->assertForbidden();
});

it('hides a message only for the user who deleted it', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);
    $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $user->id, 'body' => 'oups']);

    $this->actingAs($user)->delete("/messages/message/{$message->id}")->assertRedirect();

    expect($message->hiddenFor()->where('users.id', $user->id)->exists())->toBeTrue();
    expect($message->hiddenFor()->where('users.id', $friend->id)->exists())->toBeFalse();
});
