<?php

use App\Models\StaffMessage;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a user without the messagerie flag from accessing the staff conversation', function () {
    $user = User::factory()->role(Role::Admin)->create(['is_messagerie' => false]);

    $this->actingAs($user)->get('/messagerie')->assertForbidden();
});

it('shows only other messagerie-flagged users and marks the visitor active', function () {
    $self = User::factory()->messagerie()->create();
    $colleague = User::factory()->messagerie()->create();
    User::factory()->create(['is_messagerie' => false]);

    $this->actingAs($self)->get('/messagerie')->assertInertia(fn ($page) => $page
        ->component('Messagerie/Index')
        ->has('others', 1)
        ->where('others.0.id', $colleague->id)
    );

    expect($self->fresh()->last_activity)->not->toBeNull();
});

it('sends a message with an attachment to the shared conversation', function () {
    Storage::fake('public');
    $self = User::factory()->messagerie()->create();

    $this->actingAs($self)->post('/messagerie', [
        'body' => 'Bonjour équipe',
        'attachments' => [UploadedFile::fake()->image('note.jpg')],
    ])->assertRedirect();

    $message = StaffMessage::query()->sole();
    expect($message->body)->toBe('Bonjour équipe');
    expect($message->attachments)->toHaveCount(1);
});

it('marks messages from others as read when visiting or polling', function () {
    $self = User::factory()->messagerie()->create();
    $colleague = User::factory()->messagerie()->create();
    $message = StaffMessage::factory()->create(['sender_id' => $colleague->id]);

    $this->actingAs($self)->get('/messagerie')->assertOk();

    expect($message->fresh()->read_at)->not->toBeNull();
});

it('returns only new messages since the given id when polling', function () {
    $self = User::factory()->messagerie()->create();
    $old = StaffMessage::factory()->create(['sender_id' => $self->id]);
    $new = StaffMessage::factory()->create(['sender_id' => $self->id]);

    $response = $this->actingAs($self)->getJson("/messagerie/sondage?since_id={$old->id}");

    $response->assertOk();
    $ids = collect($response->json('messages'))->pluck('id');
    expect($ids)->toContain($new->id);
    expect($ids)->not->toContain($old->id);
});

it('lets a member hide a message only for themselves', function () {
    $self = User::factory()->messagerie()->create();
    $message = StaffMessage::factory()->create(['sender_id' => $self->id]);

    $this->actingAs($self)->delete("/messagerie/{$message->id}", ['scope' => 'me'])->assertRedirect();

    expect($message->hiddenFor()->where('users.id', $self->id)->exists())->toBeTrue();
    expect($message->fresh()->body)->not->toBeNull();
});

it('lets the author delete their message for everyone', function () {
    $self = User::factory()->messagerie()->create();
    $message = StaffMessage::factory()->create(['sender_id' => $self->id]);

    $this->actingAs($self)->delete("/messagerie/{$message->id}", ['scope' => 'everyone'])->assertRedirect();

    $message->refresh();
    expect($message->body)->toBeNull();
    expect($message->deleted_for_everyone_at)->not->toBeNull();
});

it('forbids deleting someone elses message for everyone', function () {
    $self = User::factory()->messagerie()->create();
    $colleague = User::factory()->messagerie()->create();
    $message = StaffMessage::factory()->create(['sender_id' => $colleague->id]);

    $this->actingAs($self)->delete("/messagerie/{$message->id}", ['scope' => 'everyone'])->assertForbidden();
});

it('wipes the whole conversation for everyone when requested', function () {
    $self = User::factory()->messagerie()->create();
    StaffMessage::factory()->count(3)->create();

    $this->actingAs($self)->post('/messagerie/supprimer', ['scope' => 'everyone'])->assertRedirect();

    expect(StaffMessage::query()->whereNull('deleted_for_everyone_at')->count())->toBe(0);
});

it('only hides the conversation history for the requesting user', function () {
    $self = User::factory()->messagerie()->create();
    $others = StaffMessage::factory()->count(2)->create();

    $this->actingAs($self)->post('/messagerie/supprimer', ['scope' => 'me'])->assertRedirect();

    expect($self->hiddenStaffMessages()->count())->toBe(2);
    expect(StaffMessage::query()->whereNull('deleted_for_everyone_at')->count())->toBe(2);
});

it('searches messages by content', function () {
    $self = User::factory()->messagerie()->create();
    StaffMessage::factory()->create(['sender_id' => $self->id, 'body' => 'Réunion pédagogique demain']);
    StaffMessage::factory()->create(['sender_id' => $self->id, 'body' => 'Autre chose']);

    $response = $this->actingAs($self)->getJson('/messagerie/recherche?q=pédagogique');

    $response->assertOk();
    expect($response->json('results'))->toHaveCount(1);
});
