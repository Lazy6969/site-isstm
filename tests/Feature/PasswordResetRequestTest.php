<?php

use App\Models\PasswordResetRequest;
use App\Models\User;
use App\Notifications\PasswordResetApproved;
use App\Notifications\PasswordResetRefused;
use App\Notifications\PasswordResetRequested;
use App\PasswordResetRequestStatus;
use App\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Permission;

it('lets a student ask for a password reset from their profile', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->post('/profil/demande-reinitialisation')->assertRedirect();

    expect($student->passwordResetRequests()->enAttente()->count())->toBe(1);
});

it('does not stack a second pending request', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    PasswordResetRequest::factory()->for($student)->create();

    $this->actingAs($student)->post('/profil/demande-reinitialisation')->assertRedirect();

    expect(PasswordResetRequest::count())->toBe(1);
});

it('requires a signed-in account to ask', function () {
    $this->post('/profil/demande-reinitialisation')->assertRedirect('/login');
});

it('shows the pending state on the student profile', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    PasswordResetRequest::factory()->for($student)->create();

    $this->actingAs($student)->get('/profil')->assertInertia(fn ($page) => $page->where('passwordResetPending', true));
});

it('lists the requests for an admin on the Sécurité screen', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    PasswordResetRequest::factory()->count(2)->create();

    $this->actingAs($admin)->get('/console/securite')->assertInertia(fn ($page) => $page
        ->component('Admin/Securite/Index')
        ->has('requests', 2)
    );
});

it('keeps the Sécurité screen away from a student', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->get('/console/securite')->assertForbidden();
});

it('accepts a request: temporary password set and e-mailed to the student', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $student = User::factory()->role(Role::Etudiant)->create(['password' => 'Secret123']);
    $request = PasswordResetRequest::factory()->for($student)->create();

    $this->actingAs($admin)->post("/console/securite/{$request->id}/accepter")->assertRedirect();

    expect(Hash::check('00000000', $student->fresh()->password))->toBeTrue()
        ->and($request->fresh()->status)->toBe(PasswordResetRequestStatus::Accepte)
        ->and($request->fresh()->handled_by)->toBe($admin->id);
    Notification::assertSentTo($student, PasswordResetApproved::class);
});

it('refuses a request without touching the password', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $student = User::factory()->role(Role::Etudiant)->create(['password' => 'Secret123']);
    $request = PasswordResetRequest::factory()->for($student)->create();

    $this->actingAs($admin)->post("/console/securite/{$request->id}/refuser")->assertRedirect();

    expect(Hash::check('Secret123', $student->fresh()->password))->toBeTrue()
        ->and($request->fresh()->status)->toBe(PasswordResetRequestStatus::Refuse);
    Notification::assertSentTo($student, PasswordResetRefused::class);
});

it('cannot handle the same request twice', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $request = PasswordResetRequest::factory()->accepte()->create();

    $this->actingAs($admin)->post("/console/securite/{$request->id}/accepter")->assertStatus(409);
});

it('notifies the admins who can validate resets when a student asks', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $admin->givePermissionTo(Permission::findOrCreate('security.manage', 'web'));
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->post('/profil/demande-reinitialisation');

    Notification::assertSentTo($admin, PasswordResetRequested::class);
});
