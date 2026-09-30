<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInscriptionRequest;
use App\Models\ActivityLog;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Inscription;
use App\Notifications\InscriptionApproved;
use App\Notifications\InscriptionCorrectionRequested;
use App\Notifications\InscriptionRefused;
use App\StatutInscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as ResponseFacade;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class InscriptionController extends Controller
{
    /**
     * Dossiers a student has actually submitted and that aren't yet decided —
     * Brouillon dossiers are invisible here, same rationale as
     * Admin\PreinscriptionController::ACTIVE_STATUSES.
     */
    private const ACTIVE_STATUSES = [StatutInscription::EnAttente, StatutInscription::EnExamen, StatutInscription::ACompleter];

    public function index(): Response
    {
        return Inertia::render('Admin/Scolarite/Inscriptions/Index', [
            'inscriptions' => Inscription::with(['etudiant.user:id,name', 'classe:id,nom,niveau', 'filiere:id,nom_fr'])
                ->orderBy('annee', 'desc')
                ->orderBy('created_at', 'desc')
                ->get(),
            'etudiants' => Etudiant::with('user:id,name')->orderBy('matricule')->get(['id', 'user_id', 'matricule']),
            'classes' => Classe::orderBy('nom')->get(['id', 'nom', 'niveau', 'annee']),
        ]);
    }

    public function show(Inscription $inscription): Response
    {
        if ($inscription->statut === StatutInscription::EnAttente && $inscription->type !== null) {
            $inscription->update(['statut' => StatutInscription::EnExamen, 'reviewed_at' => now()]);
        }

        return Inertia::render('Admin/Scolarite/Inscriptions/Show', [
            'inscription' => $inscription->load(['etudiant.user:id,name,avatar_path', 'filiere:id,nom_fr']),
            'classes' => Classe::orderBy('nom')->get(['id', 'nom', 'niveau', 'annee']),
        ]);
    }

    public function store(StoreInscriptionRequest $request): RedirectResponse
    {
        $inscription = Inscription::create($request->validated());

        return back()->with('status', "Inscription {$inscription->annee} enregistrée.");
    }

    public function update(Request $request, Inscription $inscription): RedirectResponse
    {
        $validated = $request->validate([
            'statut' => ['required', Rule::enum(StatutInscription::class)],
            'numero' => ['nullable', 'string', 'max:50'],
        ]);

        $inscription->update($validated);

        return back()->with('status', 'Inscription mise à jour.');
    }

    /**
     * Sends a self-service dossier back to the student for missing information
     * or pieces — it stays the same Inscription row until they resubmit it,
     * this time in the À compléter state.
     */
    public function requestCorrection(Request $request, Inscription $inscription): RedirectResponse
    {
        abort_if(! in_array($inscription->statut, self::ACTIVE_STATUSES, true), 409, 'Ce dossier a déjà été traité.');

        $validated = $request->validate([
            'commentaire_correction' => ['required', 'string', 'max:1000'],
        ]);

        $inscription->update([
            'statut' => StatutInscription::ACompleter,
            'commentaire_correction' => $validated['commentaire_correction'],
        ]);

        try {
            $inscription->etudiant->user->notify(new InscriptionCorrectionRequested($validated['commentaire_correction']));
        } catch (Throwable $e) {
            report($e);
        }

        ActivityLog::record(
            'inscription_correction_requested',
            "Correction demandée pour le dossier de {$inscription->etudiant->user->name}",
            $inscription,
        );

        return back()->with('status', "Une demande de correction a été envoyée à {$inscription->etudiant->user->name}.");
    }

    public function approve(Request $request, Inscription $inscription): RedirectResponse
    {
        abort_if(! in_array($inscription->statut, self::ACTIVE_STATUSES, true), 409, 'Ce dossier a déjà été traité.');

        $validated = $request->validate([
            'classe_id' => ['required', 'exists:classes,id'],
        ]);

        $inscription->update([
            'classe_id' => $validated['classe_id'],
            'statut' => StatutInscription::Validee,
        ]);

        $classe = Classe::find($validated['classe_id']);
        $user = $inscription->etudiant->user;

        if ($inscription->type !== null) {
            try {
                $user->notify(new InscriptionApproved($inscription->type, "{$classe->nom} ({$classe->niveau})"));
            } catch (Throwable $e) {
                report($e);
            }
        }

        ActivityLog::record('inscription_approved', "Inscription validée pour {$user->name} ({$classe->nom})", $inscription);

        return back()->with('status', "Inscription validée pour {$user->name}.");
    }

    public function refuse(Request $request, Inscription $inscription): RedirectResponse
    {
        abort_if(! in_array($inscription->statut, self::ACTIVE_STATUSES, true), 409, 'Ce dossier a déjà été traité.');

        $validated = $request->validate([
            'motif_refus' => ['nullable', 'string', 'max:1000'],
        ]);

        $inscription->update([
            'statut' => StatutInscription::Annulee,
            'motif_refus' => $validated['motif_refus'] ?? null,
        ]);

        $user = $inscription->etudiant->user;

        if ($inscription->type !== null) {
            try {
                $user->notify(new InscriptionRefused($validated['motif_refus'] ?? null));
            } catch (Throwable $e) {
                report($e);
            }
        }

        ActivityLog::record('inscription_refused', "Inscription refusée pour {$user->name}", $inscription);

        return back()->with('status', "Dossier de {$user->name} refusé.");
    }

    /**
     * CSV — no Excel library is installed, and CSV opens fine in Excel without adding one.
     */
    public function export(): StreamedResponse
    {
        $inscriptions = Inscription::with(['etudiant.user:id,name', 'classe:id,nom,niveau', 'filiere:id,nom_fr'])
            ->orderByDesc('created_at')
            ->get();

        return ResponseFacade::streamDownload(function () use ($inscriptions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Numéro de dossier', 'Étudiant', 'Type', 'Année', 'Classe', 'Filière souhaitée', 'Statut', 'Créé le']);

            foreach ($inscriptions as $i) {
                fputcsv($handle, [
                    $i->numero_dossier ?? $i->numero,
                    $i->etudiant?->user?->name,
                    $i->type?->label() ?? 'Saisie manuelle',
                    $i->annee,
                    $i->classe?->nom,
                    $i->filiere?->nom_fr,
                    $i->statut->label(),
                    $i->created_at?->format('d/m/Y'),
                ]);
            }

            fclose($handle);
        }, 'inscriptions.csv');
    }

    public function destroy(Inscription $inscription): RedirectResponse
    {
        $inscription->delete();

        return back()->with('status', 'Inscription supprimée.');
    }
}
