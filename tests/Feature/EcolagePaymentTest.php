<?php

use App\EcolageStatus;
use App\Models\EcolagePayment;
use App\Models\Etudiant;
use App\Models\User;
use App\Notifications\EcolagePaymentReviewed;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

function studentWithDossier(): array
{
    $user = User::factory()->role(Role::Etudiant)->create();
    $etudiant = Etudiant::factory()->create(['user_id' => $user->id]);

    return [$user, $etudiant];
}

function validPaymentInput(array $overrides = []): array
{
    return array_merge([
        'annee_universitaire' => '2025-2026',
        'type' => 'v1',
        'mode' => 'banque',
        'amount' => 250000,
        'reference' => 'bv-2026-0001',
        'paid_at' => now()->subDay()->toDateString(),
        'receipt' => UploadedFile::fake()->image('recu.jpg'),
        'card' => UploadedFile::fake()->image('carte.jpg'),
    ], $overrides);
}

it('shows a student their own écolage page', function () {
    [$user, $etudiant] = studentWithDossier();
    EcolagePayment::factory()->validated()->create(['etudiant_id' => $etudiant->id, 'amount' => 300000]);
    EcolagePayment::factory()->create(); // someone else's

    $this->actingAs($user)->get('/ecolage')->assertInertia(fn ($page) => $page
        ->component('Ecolage/Index')
        ->where('student.matricule', $etudiant->matricule)
        ->has('payments', 1)
        ->where('totals.valide', 300000)
    );
});

it('lets a student declare a versement with both proofs, stored privately', function () {
    Storage::fake('local');
    [$user, $etudiant] = studentWithDossier();

    $this->actingAs($user)->post('/ecolage', validPaymentInput())->assertRedirect();

    $payment = $etudiant->ecolagePayments()->first();
    expect($payment)->not->toBeNull()
        ->and($payment->reference)->toBe('BV-2026-0001')
        ->and($payment->status)->toBe(EcolageStatus::EnAttente);
    Storage::disk('local')->assertExists([$payment->receipt_path, $payment->card_path]);
});

it('requires the receipt and the student card', function () {
    Storage::fake('local');
    [$user] = studentWithDossier();

    $this->actingAs($user)->post('/ecolage', validPaymentInput(['receipt' => null, 'card' => null]))
        ->assertSessionHasErrors(['receipt', 'card']);
});

it('refuses a reference that is already declared, but frees it once refused', function () {
    Storage::fake('local');
    [$user] = studentWithDossier();
    $held = EcolagePayment::factory()->create(['reference' => 'BV-2026-0001']);

    $this->actingAs($user)->post('/ecolage', validPaymentInput())->assertSessionHasErrors('reference');

    $held->update(['status' => EcolageStatus::Refuse]);

    $this->actingAs($user)->post('/ecolage', validPaymentInput())->assertSessionDoesntHaveErrors();
});

it('rejects a future date and a non-image student card', function () {
    Storage::fake('local');
    [$user] = studentWithDossier();

    $this->actingAs($user)->post('/ecolage', validPaymentInput([
        'paid_at' => now()->addDay()->toDateString(),
        'card' => UploadedFile::fake()->create('carte.pdf', 100, 'application/pdf'),
    ]))->assertSessionHasErrors(['paid_at', 'card']);
});

it('keeps the page to students who have a dossier', function () {
    $teacher = User::factory()->role(Role::Enseignant)->create();

    $this->actingAs($teacher)->get('/ecolage')->assertForbidden();
});

it('sends a guest to the login page', function () {
    $this->get('/ecolage')->assertRedirect('/login');
});

it('only serves a proof to its owner', function () {
    Storage::fake('local');
    [$user, $etudiant] = studentWithDossier();
    [$other] = studentWithDossier();
    Storage::disk('local')->put('ecolage/receipts/a.jpg', 'x');
    $payment = EcolagePayment::factory()->create(['etudiant_id' => $etudiant->id, 'receipt_path' => 'ecolage/receipts/a.jpg']);

    $this->actingAs($user)->get("/ecolage/{$payment->id}/fichier/receipt")->assertOk();
    $this->actingAs($other)->get("/ecolage/{$payment->id}/fichier/receipt")->assertForbidden();
    $this->actingAs($user)->get("/ecolage/{$payment->id}/fichier/passwd")->assertNotFound();
});

it('lets a student withdraw a pending versement but not a decided one', function () {
    Storage::fake('local');
    [$user, $etudiant] = studentWithDossier();
    $pending = EcolagePayment::factory()->create(['etudiant_id' => $etudiant->id]);
    $decided = EcolagePayment::factory()->validated()->create(['etudiant_id' => $etudiant->id]);

    $this->actingAs($user)->delete("/ecolage/{$pending->id}")->assertRedirect();
    $this->actingAs($user)->delete("/ecolage/{$decided->id}")->assertStatus(409);

    expect(EcolagePayment::find($pending->id))->toBeNull()
        ->and(EcolagePayment::onlyTrashed()->find($pending->id))->not->toBeNull()
        ->and(EcolagePayment::find($decided->id))->not->toBeNull();
});

it('keeps the admin écolage page to users who can view payments', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($student)->get('/console/ecolage')->assertForbidden();
    $this->actingAs($admin)->get('/console/ecolage')->assertInertia(fn ($page) => $page->component('Admin/Ecolage/Index'));
});

it('lists the payments with their totals for the scolarité', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    EcolagePayment::factory()->validated()->create(['amount' => 400000]);
    EcolagePayment::factory()->create(['amount' => 100000]);

    $this->actingAs($admin)->get('/console/ecolage')->assertInertia(fn ($page) => $page
        ->has('payments', 2)
        ->where('stats.total_valide', 400000)
        ->where('stats.en_attente', 1)
    );
});

it('validates a payment only once every check is ticked, then notifies the student', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $payment = EcolagePayment::factory()->create();

    $this->actingAs($admin)->post("/console/ecolage/{$payment->id}/valider", ['receipt_ok' => true])
        ->assertSessionHasErrors(['card_ok', 'amount_ok']);
    expect($payment->fresh()->status)->toBe(EcolageStatus::EnAttente);

    $this->actingAs($admin)->post("/console/ecolage/{$payment->id}/valider", ['receipt_ok' => true, 'card_ok' => true, 'amount_ok' => true])
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe(EcolageStatus::Valide)
        ->and($payment->fresh()->reviewed_by)->toBe($admin->id);
    Notification::assertSentTo($payment->etudiant->user, EcolagePaymentReviewed::class);
});

it('refuses a payment with a reason and notifies the student', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $payment = EcolagePayment::factory()->create();

    $this->actingAs($admin)->post("/console/ecolage/{$payment->id}/refuser", [])->assertSessionHasErrors('motif_refus');

    $this->actingAs($admin)->post("/console/ecolage/{$payment->id}/refuser", ['motif_refus' => 'Reçu illisible'])->assertRedirect();

    expect($payment->fresh()->status)->toBe(EcolageStatus::Refuse)->and($payment->fresh()->motif_refus)->toBe('Reçu illisible');
    Notification::assertSentTo($payment->etudiant->user, EcolagePaymentReviewed::class);
});

it('does not let a decided payment be decided again', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $payment = EcolagePayment::factory()->validated()->create();

    $this->actingAs($admin)->post("/console/ecolage/{$payment->id}/refuser", ['motif_refus' => 'Erreur'])->assertStatus(409);
});

it('does not validate a reference another payment already had validated', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    EcolagePayment::factory()->validated()->create(['reference' => 'DUP-0001']);
    $payment = EcolagePayment::factory()->create(['reference' => 'DUP-0001']);

    $this->actingAs($admin)->post("/console/ecolage/{$payment->id}/valider", ['receipt_ok' => true, 'card_ok' => true, 'amount_ok' => true])
        ->assertStatus(422);
});

it('gives the scolarité role the payment permissions and the student the page', function () {
    expect(Spatie\Permission\Models\Role::findByName('scolarite')->hasPermissionTo('payments.validate'))->toBeTrue()
        ->and(Spatie\Permission\Models\Role::findByName('etudiant')->hasPermissionTo('ecolage.submit'))->toBeTrue()
        ->and(Spatie\Permission\Models\Role::findByName('enseignant')->hasPermissionTo('ecolage.view'))->toBeFalse();
});

it('shares the number of payments awaiting review with staff who can view them', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    EcolagePayment::factory()->count(2)->create();
    EcolagePayment::factory()->validated()->create();

    $this->actingAs($admin)->get('/console/ecolage')->assertInertia(fn ($page) => $page->where('adminBadges.ecolage', 2));

    $student = User::factory()->role(Role::Etudiant)->create();
    $this->actingAs($student)->get('/amis')->assertInertia(fn ($page) => $page->where('adminBadges.ecolage', 0));
});

it('moves a deleted versement to the corbeille instead of erasing it, proofs included', function () {
    Storage::fake('local');
    Storage::disk('local')->put('ecolage/receipts/r.jpg', 'x');
    Storage::disk('local')->put('ecolage/cards/c.jpg', 'x');
    $admin = User::factory()->role(Role::Admin)->create();
    $payment = EcolagePayment::factory()->validated()->create(['receipt_path' => 'ecolage/receipts/r.jpg', 'card_path' => 'ecolage/cards/c.jpg', 'amount' => 300000]);

    $this->actingAs($admin)->delete("/console/ecolage/{$payment->id}")->assertRedirect();

    expect(EcolagePayment::find($payment->id))->toBeNull()
        ->and(EcolagePayment::onlyTrashed()->find($payment->id))->not->toBeNull();
    Storage::disk('local')->assertExists(['ecolage/receipts/r.jpg', 'ecolage/cards/c.jpg']);

    $this->actingAs($admin)->get('/console/ecolage')->assertInertia(fn ($page) => $page->has('payments', 0)->where('stats.total_valide', 0));
    $this->actingAs($admin)->get('/console/corbeille')->assertInertia(fn ($page) => $page->where('items.0.type', 'ecolage')->where('items.0.title', $payment->reference));
});

it('restores a versement from the corbeille, and erases it with its proofs on a permanent delete', function () {
    Storage::fake('local');
    Storage::disk('local')->put('ecolage/receipts/r.jpg', 'x');
    Storage::disk('local')->put('ecolage/cards/c.jpg', 'x');
    $admin = User::factory()->role(Role::Admin)->create();
    $payment = EcolagePayment::factory()->create(['receipt_path' => 'ecolage/receipts/r.jpg', 'card_path' => 'ecolage/cards/c.jpg']);
    $payment->delete();

    $this->actingAs($admin)->post("/console/corbeille/ecolage/{$payment->id}/restaurer")->assertRedirect();
    expect(EcolagePayment::find($payment->id))->not->toBeNull();

    $payment->delete();
    $this->actingAs($admin)->delete("/console/corbeille/ecolage/{$payment->id}")->assertRedirect();

    expect(EcolagePayment::withTrashed()->find($payment->id))->toBeNull();
    Storage::disk('local')->assertMissing(['ecolage/receipts/r.jpg', 'ecolage/cards/c.jpg']);
});

it('frees the reference of a deleted versement', function () {
    Storage::fake('local');
    [$user] = studentWithDossier();
    EcolagePayment::factory()->create(['reference' => 'BV-2026-0001'])->delete();

    $this->actingAs($user)->post('/ecolage', validPaymentInput())->assertSessionDoesntHaveErrors();
});
