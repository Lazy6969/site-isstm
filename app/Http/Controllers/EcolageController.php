<?php

namespace App\Http\Controllers;

use App\EcolageStatus;
use App\Http\Requests\StoreEcolagePaymentRequest;
use App\Models\EcolagePayment;
use App\Models\Etudiant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * The student's own écolage page: declare a versement with its receipt and
 * student card, then follow the scolarité's decision. Every action is scoped to
 * the signed-in student's own dossier.
 */
class EcolageController extends Controller
{
    public function index(Request $request): Response
    {
        $etudiant = $this->etudiantOf($request)->load('classe.filiere');

        $payments = $etudiant->ecolagePayments()->latest('paid_at')->latest('id')->get();

        $totalFor = fn (EcolageStatus $status) => (int) $payments->where('status', $status)->sum('amount');

        return Inertia::render('Ecolage/Index', [
            'student' => [
                'name' => $request->user()->name,
                'matricule' => $etudiant->matricule,
                'niveau' => $etudiant->classe?->niveau,
                'classe' => $etudiant->classe?->nom,
                'filiere' => $etudiant->classe?->filiere?->nom_fr,
                'avatar_path' => $request->user()->avatar_path,
            ],
            'payments' => $payments->map(fn (EcolagePayment $payment) => [
                'id' => $payment->id,
                'annee_universitaire' => $payment->annee_universitaire,
                'type' => $payment->type,
                'mode' => $payment->mode,
                'amount' => $payment->amount,
                'reference' => $payment->reference,
                'paid_at' => $payment->paid_at->toDateString(),
                'status' => $payment->status->value,
                'motif_refus' => $payment->motif_refus,
                'created_at' => $payment->created_at,
            ])->values(),
            'totals' => [
                'valide' => $totalFor(EcolageStatus::Valide),
                'en_attente' => $totalFor(EcolageStatus::EnAttente),
                'refuse' => $totalFor(EcolageStatus::Refuse),
            ],
            'options' => [
                'types' => EcolagePayment::TYPES,
                'modes' => EcolagePayment::MODES,
                'annee_universitaire' => EcolagePayment::currentAcademicYear(),
            ],
        ]);
    }

    public function store(StoreEcolagePaymentRequest $request): RedirectResponse
    {
        $etudiant = $this->etudiantOf($request);
        $validated = $request->validated();

        $etudiant->ecolagePayments()->create([
            'annee_universitaire' => $validated['annee_universitaire'],
            'type' => $validated['type'],
            'mode' => $validated['mode'],
            'amount' => $validated['amount'],
            'reference' => $validated['reference'],
            'paid_at' => $validated['paid_at'],
            'receipt_path' => $request->file('receipt')->store('ecolage/receipts', 'local'),
            'card_path' => $request->file('card')->store('ecolage/cards', 'local'),
        ]);

        return back()->with('status', 'Versement déclaré. La scolarité va le vérifier.');
    }

    /**
     * Only a payment still waiting for review can be withdrawn — a decided one
     * is part of the accounting record. Withdrawing soft-deletes it: the scolarité
     * finds it in its corbeille (proofs kept) and can restore or erase it.
     */
    public function destroy(Request $request, EcolagePayment $payment): RedirectResponse
    {
        $etudiant = $this->etudiantOf($request);
        abort_unless($payment->etudiant_id === $etudiant->id, 403);
        abort_unless($payment->status === EcolageStatus::EnAttente, 409, 'Ce versement a déjà été traité.');

        $payment->delete();

        return back()->with('status', 'Versement retiré.');
    }

    public function file(Request $request, EcolagePayment $payment, string $type): BinaryFileResponse
    {
        $etudiant = $this->etudiantOf($request);
        abort_unless($payment->etudiant_id === $etudiant->id, 403);

        return static::serve($payment, $type);
    }

    /**
     * Streams one of a payment's two proofs from the private disk.
     */
    public static function serve(EcolagePayment $payment, string $type): BinaryFileResponse
    {
        abort_unless(in_array($type, ['receipt', 'card'], true), 404);

        $path = $type === 'receipt' ? $payment->receipt_path : $payment->card_path;
        abort_unless(Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path));
    }

    private function etudiantOf(Request $request): Etudiant
    {
        $etudiant = $request->user()->etudiant;
        abort_if($etudiant === null, 403, "Cette page est réservée aux étudiants disposant d'un dossier.");

        return $etudiant;
    }
}
