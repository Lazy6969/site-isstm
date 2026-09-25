<?php

use App\GroupMemberRole;
use App\Models\ClassGroup;
use App\Models\ClassGroupAnnouncement;
use App\Models\ClassGroupMember;
use App\Models\User;
use App\Role;

it('lets a student create their own class group and become its first member', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $response = $this->actingAs($student)->post('/groupes', ['name' => 'Groupe de révision', 'type' => 'classe']);

    $group = ClassGroup::query()->first();
    $response->assertRedirect(route('class-groups.show', $group));
    expect($group->teacher_id)->toBe($student->id);

    $membership = ClassGroupMember::query()->where('class_group_id', $group->id)->where('user_id', $student->id)->sole();
    expect($membership->role_in_group)->toBe(GroupMemberRole::Enseignant);
});

it('lets a teacher create a class group and become its first member', function () {
    $teacher = User::factory()->role(Role::Enseignant)->create();

    $response = $this->actingAs($teacher)->post('/groupes', [
        'name' => 'L1 Informatique',
        'type' => 'classe',
        'annee' => '2026',
        'niveau' => 'L1',
    ]);

    $group = ClassGroup::query()->first();
    $response->assertRedirect(route('class-groups.show', $group));
    expect($group->join_code)->toHaveLength(6);
    expect($group->teacher_id)->toBe($teacher->id);

    $membership = ClassGroupMember::query()->where('class_group_id', $group->id)->where('user_id', $teacher->id)->sole();
    expect($membership->role_in_group)->toBe(GroupMemberRole::Enseignant);
});

it('lets a student join a group with a valid code', function () {
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->post('/groupes/rejoindre', ['code' => $group->join_code])->assertRedirect(route('class-groups.show', $group));

    $membership = ClassGroupMember::query()->where('class_group_id', $group->id)->where('user_id', $student->id)->sole();
    expect($membership->role_in_group)->toBe(GroupMemberRole::Etudiant);
});

it('refuses an invalid join code', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->post('/groupes/rejoindre', ['code' => 'ZZZZZZ'])->assertNotFound();
});

it('refuses joining a group twice', function () {
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($student)->post('/groupes/rejoindre', ['code' => $group->join_code])->assertStatus(409);
});

it('forbids a non-member from viewing a group', function () {
    $group = ClassGroup::factory()->create();
    $outsider = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($outsider)->get("/groupes/{$group->id}")->assertForbidden();
});

it('lets the teacher ban a student but not another teacher', function () {
    $group = ClassGroup::factory()->create();
    $teacher = $group->teacher;
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $teacher->id, 'role_in_group' => GroupMemberRole::Enseignant]);

    $student = User::factory()->role(Role::Etudiant)->create();
    $studentMembership = ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($teacher)->post("/groupes/membres/{$studentMembership->id}/bannir")->assertRedirect();
    expect($studentMembership->refresh()->is_banned)->toBeTrue();
});

it('forbids a student from banning another member', function () {
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $target = User::factory()->role(Role::Etudiant)->create();
    $targetMembership = ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $target->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($student)->post("/groupes/membres/{$targetMembership->id}/bannir")->assertForbidden();
});

it('lets the teacher promote a student to class delegate', function () {
    $group = ClassGroup::factory()->create();
    $teacher = $group->teacher;
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $teacher->id, 'role_in_group' => GroupMemberRole::Enseignant]);

    $student = User::factory()->role(Role::Etudiant)->create();
    $studentMembership = ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($teacher)->post("/groupes/membres/{$studentMembership->id}/delegue")->assertRedirect();
    expect($studentMembership->refresh()->is_delegate)->toBeTrue();
});

it('publishes and deletes a pinned announcement as the teacher', function () {
    $group = ClassGroup::factory()->create();
    $teacher = $group->teacher;
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $teacher->id, 'role_in_group' => GroupMemberRole::Enseignant]);

    $response = $this->actingAs($teacher)->post("/groupes/{$group->id}/annonces", [
        'type' => 'devoir',
        'title' => 'Rendu du TP',
        'description' => 'Pour vendredi',
    ]);
    $response->assertRedirect();

    $announcement = ClassGroupAnnouncement::query()->sole();
    expect($announcement->title)->toBe('Rendu du TP');

    $this->actingAs($teacher)->delete("/groupes/annonces/{$announcement->id}")->assertRedirect();
    expect(ClassGroupAnnouncement::query()->count())->toBe(0);
});

it('forbids a student from publishing an announcement', function () {
    $group = ClassGroup::factory()->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $student->id, 'role_in_group' => GroupMemberRole::Etudiant]);

    $this->actingAs($student)->post("/groupes/{$group->id}/annonces", [
        'type' => 'devoir',
        'title' => 'Rendu du TP',
    ])->assertForbidden();
});
