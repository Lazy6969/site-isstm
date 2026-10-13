<?php

use App\GroupMemberRole;
use App\Models\ClassGroup;
use App\Models\ClassGroupMember;
use App\Models\ClassGroupMessage;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-member from sending a message', function () {
    $group = ClassGroup::factory()->create();
    $outsider = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($outsider)->post("/groupes/{$group->id}/messages", ['body' => 'salut'])->assertForbidden();
});

it('sends a message with an attachment', function () {
    Storage::fake('public');
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($student)->post("/groupes/{$group->id}/messages", [
        'body' => 'Voici le cours',
        'attachments' => [UploadedFile::fake()->image('cours.jpg')],
    ])->assertRedirect();

    $message = ClassGroupMessage::query()->sole();
    expect($message->body)->toBe('Voici le cours');
    expect($message->attachments)->toHaveCount(1);
});

it('lets a member hide a message only for themselves', function () {
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);
    $message = ClassGroupMessage::create(['class_group_id' => $group->id, 'sender_id' => $student->id, 'body' => 'oups']);

    $this->actingAs($student)->delete("/groupes/messages/{$message->id}", ['scope' => 'me'])->assertRedirect();

    expect($message->hiddenFor()->where('users.id', $student->id)->exists())->toBeTrue();
    expect($message->fresh()->body)->toBe('oups');
});

it('lets the author delete a message for everyone', function () {
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);
    $message = ClassGroupMessage::create(['class_group_id' => $group->id, 'sender_id' => $student->id, 'body' => 'oups']);

    $this->actingAs($student)->delete("/groupes/messages/{$message->id}", ['scope' => 'everyone'])->assertRedirect();

    $message->refresh();
    expect($message->body)->toBeNull();
    expect($message->deleted_for_everyone_at)->not->toBeNull();
});

it('forbids a student from deleting someone elses message for everyone', function () {
    $group = ClassGroup::factory()->create();
    $author = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $author->id, 'role_in_group' => GroupMemberRole::Etudiant]);
    $message = ClassGroupMessage::create(['class_group_id' => $group->id, 'sender_id' => $author->id, 'body' => 'oups']);

    $other = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $other->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($other)->delete("/groupes/messages/{$message->id}", ['scope' => 'everyone'])->assertForbidden();
});

it('lets the teacher delete any members message for everyone', function () {
    $group = ClassGroup::factory()->create();
    $teacher = $group->teacher;
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $teacher->id, 'role_in_group' => GroupMemberRole::Enseignant]);

    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);
    $message = ClassGroupMessage::create(['class_group_id' => $group->id, 'sender_id' => $student->id, 'body' => 'oups']);

    $this->actingAs($teacher)->delete("/groupes/messages/{$message->id}", ['scope' => 'everyone'])->assertRedirect();
    expect($message->fresh()->deleted_for_everyone_at)->not->toBeNull();
});

it('accepts every common kind of attachment in a group chat', function (string $name, string $mime) {
    Storage::fake('public');
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($student)->post("/groupes/{$group->id}/messages", [
        'attachments' => [UploadedFile::fake()->create($name, 200, $mime)],
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(ClassGroupMessage::query()->sole()->attachments)->toHaveCount(1);
})->with([
    'image' => ['photo.png', 'image/png'],
    'pdf' => ['cours.pdf', 'application/pdf'],
    'word' => ['devoir.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'word 97' => ['devoir.doc', 'application/msword'],
    'excel' => ['notes.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'powerpoint' => ['expose.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    'zip' => ['projet.zip', 'application/zip'],
    'rar' => ['projet.rar', 'application/x-rar-compressed'],
    'texte' => ['readme.txt', 'text/plain'],
    'csv' => ['donnees.csv', 'text/csv'],
]);

it('explains why an attachment is refused', function () {
    Storage::fake('public');
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($student)->post("/groupes/{$group->id}/messages", [
        'attachments' => [UploadedFile::fake()->create('page.html', 10, 'text/html')],
    ])->assertSessionHasErrors('attachments.0');

    $this->actingAs($student)->post("/groupes/{$group->id}/messages", [
        'attachments' => [UploadedFile::fake()->create('trop-gros.pdf', 11000, 'application/pdf')],
    ])->assertSessionHasErrors('attachments.0');
});
