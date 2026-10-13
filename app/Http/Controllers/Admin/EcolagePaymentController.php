<?php

namespace App\Http\Controllers\Admin;

use App\EcolageStatus;
use App\Http\Controllers\Controller;
use App\Http\Controllers\EcolageController;
use App\Models\ActivityLog;
use App\Models\EcolagePayment;
use App\Notifications\EcolagePaymentReviewed;
use App\XlsxWriter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class EcolagePaymentController extends Controller
{
    public function index(): Response
    {
        $payments = EcolagePayment::with(['etudiant.user:id,name,email,avatar_path', 'etudiant.classe.filiere:id,nom_fr', 'reviewer:id,name'])
            ->latest('created_at')
            ->limit(500)
            ->get();

        $referenceCounts = $payments->where('status', '!=', EcolageStatus::Refuse)->countBy('reference');

        return Inertia::render('Admin/Ecolage/Index', [
            'payments' => $payments->map(fn (EcolagePayment $payment) => [
                'id' => $payment->id,
                'student' => [
                    'name' => $payment->etudiant->nom
                        ? trim($payment->etudiant->nom.' '.$payment->etudiant->prenoms)
                        : $payment->etudiant->user?->name,
                    'email' => $payment->etudiant->user?->email,
                    'avatar_path' => $payment->etudiant->user?->avatar_path,
                    'matricule' => $payment->etudiant->matricule,
                    'telephone' => $payment->etudiant->telephone,
                    'niveau' => $payment->etudiant->classe?->niveau,
                    'classe' => $payment->etudiant->classe?->nom,
                    'filiere' => $payment->etudiant->classe?->filiere?->nom_fr,
                ],
                'annee_universitaire' => $payment->annee_universitaire,
                'type' => $payment->type,
                'mode' => $payment->mode,
                'amount' => $payment->amount,
                'reference' => $payment->reference,
                'receipt_ext' => strtolower(pathinfo($payment->receipt_path, PATHINFO_EXTENSION)),
                'paid_at' => $payment->paid_at->toDateString(),
                'status' => $payment->status->value,
                'motif_refus' => $payment->motif_refus,
                'reviewer' => $payment->reviewer?->name,
                'reviewed_at' => $payment->reviewed_at,
                'created_at' => $payment->created_at,
                'duplicate_reference' => $payment->status !== EcolageStatus::Refuse && ($referenceCounts[$payment->reference] ?? 0) > 1,
            ])->values(),
            'stats' => [
                'en_attente' => EcolagePayment::where('status', EcolageStatus::EnAttente)->count(),
                'valide' => EcolagePayment::where('status', EcolageStatus::Valide)->count(),
                'refuse' => EcolagePayment::where('status', EcolageStatus::Refuse)->count(),
                'total_valide' => (int) EcolagePayment::where('status', EcolageStatus::Valide)->sum('amount'),
                'total_attente' => (int) EcolagePayment::where('status', EcolageStatus::EnAttente)->sum('amount'),
            ],
            'options' => ['types' => EcolagePayment::TYPES, 'modes' => EcolagePayment::MODES],
        ]);
    }

    /**
     * Approving needs the reviewer to tick every check — the same list the page
     * shows — so a payment can't be validated without actually comparing the
     * receipt with the student card.
     */
    public function approve(Request $request, EcolagePayment $payment): RedirectResponse
    {
        abort_unless($payment->status === EcolageStatus::EnAttente, 409, 'Ce versement a déjà été traité.');

        $request->validate([
            'receipt_ok' => ['accepted'],
            'card_ok' => ['accepted'],
            'amount_ok' => ['accepted'],
        ], [
            'accepted' => 'Cochez les trois vérifications avant de valider.',
        ]);

        $duplicate = EcolagePayment::holdingReference($payment->reference)
            ->where('id', '!=', $payment->id)
            ->where('status', EcolageStatus::Valide)
            ->exists();
        abort_if($duplicate, 422, 'Cette référence a déjà été validée pour un autre versement.');

        $this->decide($request, $payment, EcolageStatus::Valide);

        return back()->with('status', 'Versement validé.');
    }

    public function refuse(Request $request, EcolagePayment $payment): RedirectResponse
    {
        abort_unless($payment->status === EcolageStatus::EnAttente, 409, 'Ce versement a déjà été traité.');

        $validated = $request->validate(['motif_refus' => ['required', 'string', 'min:3', 'max:500']]);

        $payment->motif_refus = $validated['motif_refus'];
        $this->decide($request, $payment, EcolageStatus::Refuse);

        return back()->with('status', 'Versement refusé.');
    }

    /**
     * Soft delete: the versement goes to the Corbeille, proofs included, and can be
     * restored or erased for good from there (see TrashController).
     */
    public function destroy(EcolagePayment $payment): RedirectResponse
    {
        ActivityLog::record('ecolage_deleted', "Versement {$payment->reference} mis à la corbeille", $payment);
        $payment->delete();

        return back()->with('status', 'Versement placé dans la corbeille.');
    }

    public function file(EcolagePayment $payment, string $type): BinaryFileResponse
    {
        return EcolageController::serve($payment, $type);
    }

    public function export(): BinaryFileResponse
    {
        $rows = EcolagePayment::with(['etudiant.user:id,name', 'etudiant.classe:id,nom,niveau'])
            ->orderByDesc('paid_at')
            ->get()
            ->map(fn (EcolagePayment $payment) => [
                $payment->etudiant->matricule,
                $payment->etudiant->user?->name,
                $payment->etudiant->classe?->niveau,
                $payment->annee_universitaire,
                EcolagePayment::TYPES[$payment->type] ?? $payment->type,
                EcolagePayment::MODES[$payment->mode] ?? $payment->mode,
                $payment->amount,
                $payment->reference,
                $payment->paid_at->format('d/m/Y'),
                $payment->status->label(),
                $payment->motif_refus,
            ]);

        return XlsxWriter::download('ecolage_'.now()->format('Y-m-d').'.xlsx', 'Écolage', [
            'Matricule', 'Étudiant', 'Niveau', 'Année', 'Type', 'Mode', 'Montant (Ar)', 'Référence', 'Date du versement', 'Statut', 'Motif de refus',
        ], $rows);
    }

    private function decide(Request $request, EcolagePayment $payment, EcolageStatus $status): void
    {
        $payment->status = $status;
        $payment->reviewed_by = $request->user()->id;
        $payment->reviewed_at = now();
        $payment->save();

        ActivityLog::record(
            $status === EcolageStatus::Valide ? 'ecolage_validated' : 'ecolage_refused',
            "Versement {$payment->reference} ".($status === EcolageStatus::Valide ? 'validé' : 'refusé'),
            $payment,
        );

        try {
            $payment->etudiant->user?->notify(new EcolagePaymentReviewed($payment));
        } catch (Throwable $e) {
            report($e);
        }
    }
}
