<?php

use App\Models\ActivityLog;
use App\Models\Preinscription;
use App\Models\User;
use App\Role;

it('forbids a non-privileged user from viewing the activity log', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/activity-log')->assertForbidden();
});

it('lets the super admin view the activity log', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/activity-log')->assertOk();
});

it('records a role change in the activity log', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $target = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($admin)->put("/console/users/{$target->id}/role", ['role' => 'enseignant']);

    expect(ActivityLog::where('action', 'role_changed')->where('subject_id', $target->id)->exists())->toBeTrue();
});

it('records a preinscription approval in the activity log', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $preinscription = Preinscription::factory()->create();

    $this->actingAs($admin)->post("/console/preinscriptions/{$preinscription->id}/approve");

    expect(ActivityLog::where('action', 'preinscription_approved')->where('subject_id', $preinscription->id)->exists())->toBeTrue();
});
