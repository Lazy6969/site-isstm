<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Candidat;
use App\Models\Etudiant;
use App\Notifications\PreinscriptionAccepted;
use App\Notifications\PreinscriptionCorrectionRequested;
use App\Notifications\PreinscriptionRefused;
use App\PreinscriptionStatus;
use App\Role;
use App\StatutEtudiant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as ResponseFacade;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class PreinscriptionController extends Controller
{
    /**
     * Every dossier a candidate has actually submitted and that isn't yet
     * decided — Brouillon dossiers are invisible here, they don't exist for
     * the scolarité until the candidate sends them.
     */
    private const ACTIVE_STATUSES = [PreinscriptionStatus::Soumis, PreinscriptionStatus::EnExamen, PreinscriptionStatus::ACompleter];

    public function index(): Response
    {
        return Inertia::render('Admin/Preinscriptions/Index', [
            'preinscriptions' => Candidat::with('filiere:id,nom_fr')
                ->whereIn('status', self::ACTIVE_STATUSES)
                ->orderBy('created_at')
                ->get(),
            // Accounts opened through the form whose dossier was never sent in.
            // Nothing to decide on them — they're listed so the scolarité can
            // see who started and follow up, not mixed in with what to process.
            'brouillons' => Candidat::query()
                ->where('status', PreinscriptionStatus::Brouillon)
                ->orderByDesc('created_at')
                ->get(['id', 'nom', 'prenoms', 'email', 'telephone', 'created_at']),
        ]);
    }

    public function show(Candidat $preinscription): Response
    {
        if ($preinscription->status === PreinscriptionStatus::Soumis) {
            $preinscription->update(['status' => PreinscriptionStatus::EnExamen, 'reviewed_at' => now()]);
        }

        return Inertia::render('Admin/Preinscriptions/Show', [
            'preinscription' => $preinscription->load('filiere:id,nom_fr'),
        ]);
    }

    /**
     * Sends the dossier back to the candidate for missing information or
     * pieces — it stays in App\Models\Candidat until they resubmit it
     * via the same wizard, this time in the À compléter state.
     */
    public function requestCorrection(Request $request, Candidat $preinscription): RedirectResponse
    {
        abort_if(! in_array($preinscription->status, [PreinscriptionStatus::Soumis, PreinscriptionStatus::EnExamen], true), 409, 'Cette préinscription a déjà été traitée.');

        $validated = $request->validate([
            'commentaire_correction' => ['required', 'string', 'max:1000'],
        ]);

        $preinscription->update([
            'status' => PreinscriptionStatus::ACompleter,
            'commentaire_correction' => $validated['commentaire_correction'],
        ]);

        try {
            $preinscription->user->notify(new PreinscriptionCorrectionRequested($validated['commentaire_correction']));
        } catch (Throwable $e) {
            report($e);
        }

        ActivityLog::record(
            'preinscription_correction_requested',
            "Correction demandée pour le dossier de {$preinscription->user->name}",
            $preinscription,
        );

        return back()->with('status', "Une demande de correction a été envoyée à {$preinscription->user->name}.");
    }

    /**
     * CSV — no Excel library is installed, and CSV opens fine in Excel without adding one.
     */
    public function export(): StreamedResponse
    {
        $preinscriptions = Candidat::with('filiere:id,nom_fr')->orderByDesc('created_at')->get();

        return ResponseFacade::streamDownload(function () use ($preinscriptions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Numéro de dossier', 'Nom', 'Prénoms', 'E-mail', 'Téléphone', 'Filière', 'Niveau', 'Statut', 'Déposé le']);

            foreach ($preinscriptions as $p) {
                fputcsv($handle, [
                    $p->numero_dossier,
                    $p->nom,
                    $p->prenoms,
                    $p->email,
                    $p->telephone,
                    $p->filiere?->nom_fr,
                    $p->niveau,
                    $p->status->label(),
                    $p->created_at?->format('d/m/Y'),
                ]);
            }

            fclose($handle);
        }, 'preinscriptions.csv');
    }

    public function approve(Candidat $preinscription): RedirectResponse
    {
        abort_if(! in_array($preinscription->status, self::ACTIVE_STATUSES, true), 409, 'Cette préinscription a déjà été traitée.');

        $user = $preinscription->user;
        $user->role = Role::Etudiant;
        $user->is_active = true;
        // Approving the dossier is what opens the étudiant space, so the account
        // has to be usable from that moment. The admin has just checked the real
        // dossier — a stronger verification than the e-mail click — and without
        // this the `verified` middleware would lock the new étudiant out of the
        // very space the approval just granted them.
        $user->email_verified_at ??= now();
        if ($user->avatar_path === null) {
            $user->avatar_path = $preinscription->photo_path;
        }
        $user->save();
        $user->syncRoles([Role::Etudiant->spatieRole()]);

        $matricule = Etudiant::generateMatricule();

        Etudiant::create([
            'user_id' => $user->id,
            'candidat_id' => $preinscription->id,
            'matricule' => $matricule,
            'statut' => StatutEtudiant::Actif,
            // Copied from the candidate's dossier so the étudiant record is
            // self-sufficient going forward — the préinscription stays intact
            // as the original candidacy archive, this is a one-time snapshot.
            'nom' => $preinscription->nom,
            'prenoms' => $preinscription->prenoms,
            'civilite' => $preinscription->civilite,
            'sexe' => $preinscription->sexe,
            'date_naissance' => $preinscription->date_naissance,
            'lieu_naissance' => $preinscription->lieu_naissance,
            'cin' => $preinscription->cin,
            'nationalite' => $preinscription->nationalite,
            'pays' => $preinscription->pays,
            'adresse' => $preinscription->adresse,
            'telephone' => $preinscription->telephone,
            'nom_pere' => $preinscription->nom_pere,
            'nom_mere' => $preinscription->nom_mere,
            'contact_parents' => $preinscription->contact_parents,
            'repondant_nom' => $preinscription->repondant_nom,
            'repondant_lien' => $preinscription->repondant_lien,
            'repondant_telephone' => $preinscription->repondant_telephone,
        ]);

        $preinscription->status = PreinscriptionStatus::Accepte;
        $preinscription->save();

        try {
            $user->notify(new PreinscriptionAccepted($matricule));
        } catch (Throwable $e) {
            report($e);
        }

        ActivityLog::record(
            'preinscription_approved',
            "Préinscription acceptée pour {$user->name} (matricule {$matricule})",
            $preinscription,
        );

        return back()->with('status', "Compte étudiant activé pour {$user->name} (matricule {$matricule}). Un e-mail de confirmation vient d'être envoyé.");
    }

    public function refuse(Request $request, Candidat $preinscription): RedirectResponse
    {
        abort_if(! in_array($preinscription->status, self::ACTIVE_STATUSES, true), 409, 'Cette préinscription a déjà été traitée.');

        $validated = $request->validate([
            'motif_refus' => ['nullable', 'string', 'max:1000'],
        ]);

        $preinscription->update([
            'status' => PreinscriptionStatus::Refuse,
            'motif_refus' => $validated['motif_refus'] ?? null,
        ]);

        try {
            $preinscription->user->notify(new PreinscriptionRefused($validated['motif_refus'] ?? null));
        } catch (Throwable $e) {
            report($e);
        }

        ActivityLog::record(
            'preinscription_refused',
            "Préinscription refusée pour {$preinscription->user->name}",
            $preinscription,
        );

        return back()->with('status', "Dossier de {$preinscription->user->name} refusé.");
    }
}
