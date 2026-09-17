<?php

use App\GroupMemberRole;
use App\Models\ClassGroup;
use App\Models\ClassGroupMember;
use App\Models\ClassGroupPresenceSession;
use App\Models\User;
use App\PresenceStatus;
use App\Role;

it('forbids a regular student from viewing the presence page', function () {
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($student)->get("/groupes/{$group->id}/presence")->assertForbidden();
});

it('lets a class delegate view but not mark presence', function () {
    $group = ClassGroup::factory()->create();
    $delegate = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create([
        'user_id' => $delegate->id,
        'role_in_group' => GroupMemberRole::Etudiant,
        'is_delegate' => true,
    ]);

    $this->actingAs($delegate)->get("/groupes/{$group->id}/presence")->assertInertia(fn ($page) => $page
        ->component('Groupes/Presence')
        ->where('canMark', false)
    );

    $this->actingAs($delegate)->post("/groupes/{$group->id}/presence", ['session_date' => '2026-09-17'])->assertForbidden();
});

it('lets the teacher mark a presence session for all active students', function () {
    $group = ClassGroup::factory()->create();
    $teacher = $group->teacher;
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $teacher->id, 'role_in_group' => GroupMemberRole::Enseignant]);

    $present = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $present->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $absent = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $absent->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $banned = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $banned->id, 'role_in_group' => GroupMemberRole::Etudiant, 'is_banned' => true]);

    $this->actingAs($teacher)->post("/groupes/{$group->id}/presence", [
        'session_date' => '2026-09-17',
        'present_user_ids' => [$present->id],
    ])->assertRedirect();

    $session = ClassGroupPresenceSession::query()->where('class_group_id', $group->id)->sole();
    expect($session->marks()->where('user_id', $present->id)->sole()->status)->toBe(PresenceStatus::Present);
    expect($session->marks()->where('user_id', $absent->id)->sole()->status)->toBe(PresenceStatus::Absent);
    expect($session->marks()->where('user_id', $banned->id)->exists())->toBeFalse();
});

it('reuses the same session when marking presence twice for the same date', function () {
    $group = ClassGroup::factory()->create();
    $teacher = $group->teacher;
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $teacher->id, 'role_in_group' => GroupMemberRole::Enseignant]);
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($teacher)->post("/groupes/{$group->id}/presence", ['session_date' => '2026-09-17', 'present_user_ids' => []])->assertSessionHasNoErrors();
    $this->actingAs($teacher)->post("/groupes/{$group->id}/presence", ['session_date' => '2026-09-17', 'present_user_ids' => [$student->id]])->assertSessionHasNoErrors();

    expect(ClassGroupPresenceSession::query()->where('class_group_id', $group->id)->count())->toBe(1);
    $session = ClassGroupPresenceSession::query()->where('class_group_id', $group->id)->sole();
    expect($session->marks()->where('user_id', $student->id)->sole()->status)->toBe(PresenceStatus::Present);
});
