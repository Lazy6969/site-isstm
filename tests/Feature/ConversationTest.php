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

it('lets the sender edit their message but forbids the recipient from editing it', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);
    $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $user->id, 'body' => 'Avant']);

    $this->actingAs($friend)->patch("/messages/message/{$message->id}", ['body' => 'Piraté'])->assertForbidden();

    $this->actingAs($user)->patch("/messages/message/{$message->id}", ['body' => 'Après'])->assertRedirect();
    expect($message->refresh()->body)->toBe('Après');
    expect($message->edited_at)->not->toBeNull();
});

it('unsends a message for everyone but only for the sender', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);
    $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $user->id, 'body' => 'oups']);

    $this->actingAs($friend)->post("/messages/message/{$message->id}/supprimer")->assertForbidden();

    $this->actingAs($user)->post("/messages/message/{$message->id}/supprimer")->assertRedirect();
    expect($message->refresh()->body)->toBeNull();
    expect($message->deleted_at)->not->toBeNull();
});

it('forwards a message into another conversation the sender is part of', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friendA = User::factory()->role(Role::Etudiant)->create();
    $friendB = User::factory()->role(Role::Etudiant)->create();
    $sourceConversation = Conversation::create(['user_one_id' => min($user->id, $friendA->id), 'user_two_id' => max($user->id, $friendA->id)]);
    $targetConversation = Conversation::create(['user_one_id' => min($user->id, $friendB->id), 'user_two_id' => max($user->id, $friendB->id)]);
    $message = Message::create(['conversation_id' => $sourceConversation->id, 'sender_id' => $friendA->id, 'body' => 'À transférer']);

    $this->actingAs($user)->post("/messages/message/{$message->id}/transferer", ['conversation_id' => $targetConversation->id])->assertRedirect();

    $forwarded = Message::query()->where('conversation_id', $targetConversation->id)->sole();
    expect($forwarded->body)->toBe('À transférer');
    expect($forwarded->forwarded_from_id)->toBe($message->id);
    expect($forwarded->sender_id)->toBe($user->id);
});

it('replies to a specific message within the same conversation', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);
    $original = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $friend->id, 'body' => 'Salut, ça va ?']);

    $this->actingAs($user)->post("/messages/{$conversation->id}/envoyer", ['body' => 'Oui et toi !', 'reply_to_id' => $original->id])->assertRedirect();

    $reply = Message::query()->where('reply_to_id', $original->id)->sole();
    expect($reply->body)->toBe('Oui et toi !');
});

it('reacts to a message and toggles the reaction off on a second identical reaction', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $conversation = Conversation::create(['user_one_id' => min($user->id, $friend->id), 'user_two_id' => max($user->id, $friend->id)]);
    $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $friend->id, 'body' => 'hello']);

    $this->actingAs($user)->post("/messages/message/{$message->id}/reaction", ['type' => 'love'])->assertRedirect();
    expect($message->reactions()->where('user_id', $user->id)->exists())->toBeTrue();

    $this->actingAs($user)->post("/messages/message/{$message->id}/reaction", ['type' => 'love'])->assertRedirect();
    expect($message->reactions()->where('user_id', $user->id)->exists())->toBeFalse();
});
