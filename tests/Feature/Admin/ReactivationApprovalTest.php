<?php

use App\Models\ReactivationRequest;
use App\Models\User;
use App\Notifications\AccountReactivated;
use App\Notifications\AccountReactivationRejected;
use App\ReactivationStatus;
use App\Role;
use Illuminate\Support\Facades\Notification;

it('forbids a non-admin from listing reactivation requests', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/reactivations')->assertForbidden();
});

it('lists reactivation requests for an admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $former = User::factory()->create(['name' => 'Ancien Etudiant']);
    ReactivationRequest::factory()->create(['user_id' => $former->id]);

    $this->actingAs($admin)->get('/console/reactivations')->assertInertia(fn ($page) => $page
        ->component('Admin/Reactivations/Index')
        ->has('reactivations', 1)
        ->where('reactivations.0.user.name', 'Ancien Etudiant')
    );
});

it('reactivates the account and notifies the student when an admin approves', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $former = User::factory()->create(['is_active' => false]);
    $reactivation = ReactivationRequest::factory()->create(['user_id' => $former->id]);

    $this->actingAs($admin)
        ->post("/console/reactivations/{$reactivation->id}/approuver")
        ->assertRedirect();

    expect($former->fresh()->is_active)->toBeTrue();

    $reactivation->refresh();
    expect($reactivation->status)->toBe(ReactivationStatus::Approuvee);
    expect($reactivation->reviewed_by)->toBe($admin->id);
    expect($reactivation->reviewed_at)->not->toBeNull();

    Notification::assertSentTo($former, AccountReactivated::class);
});

it('refuses to approve an already-decided request', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $reactivation = ReactivationRequest::factory()->create(['status' => ReactivationStatus::Approuvee]);

    $this->actingAs($admin)
        ->post("/console/reactivations/{$reactivation->id}/approuver")
        ->assertStatus(409);
});

it('rejects a request with an optional reason and notifies the student', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $former = User::factory()->create(['is_active' => false]);
    $reactivation = ReactivationRequest::factory()->create(['user_id' => $former->id]);

    $this->actingAs($admin)
        ->post("/console/reactivations/{$reactivation->id}/refuser", ['motif_refus' => 'Dossier incomplet'])
        ->assertRedirect();

    $reactivation->refresh();
    expect($reactivation->status)->toBe(ReactivationStatus::Refusee);
    expect($reactivation->motif_refus)->toBe('Dossier incomplet');
    expect($former->fresh()->is_active)->toBeFalse();

    Notification::assertSentTo($former, AccountReactivationRejected::class);
});

it('refuses to decide a request twice', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $reactivation = ReactivationRequest::factory()->create(['status' => ReactivationStatus::Refusee]);

    $this->actingAs($admin)
        ->post("/console/reactivations/{$reactivation->id}/refuser")
        ->assertStatus(409);
});

it('lets an admin delete a reactivation request, which disappears from the list but can be restored from the trash', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $reactivation = ReactivationRequest::factory()->create();

    $this->actingAs($admin)
        ->delete("/console/reactivations/{$reactivation->id}")
        ->assertRedirect();

    expect(ReactivationRequest::find($reactivation->id))->toBeNull();
    expect(ReactivationRequest::onlyTrashed()->find($reactivation->id))->not->toBeNull();
});

it('forbids a non-admin from deleting a reactivation request', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();
    $reactivation = ReactivationRequest::factory()->create();

    $this->actingAs($etudiant)
        ->delete("/console/reactivations/{$reactivation->id}")
        ->assertForbidden();

    expect(ReactivationRequest::find($reactivation->id))->not->toBeNull();
});
