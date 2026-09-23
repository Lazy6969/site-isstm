<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Etudiant;
use App\Models\Preinscription;
use App\Notifications\PreinscriptionAccepted;
use App\Notifications\PreinscriptionRefused;
use App\PreinscriptionStatus;
use App\Role;
use App\StatutEtudiant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PreinscriptionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Preinscriptions/Index', [
            'preinscriptions' => Preinscription::with('filiere:id,nom_fr')
                ->where('status', PreinscriptionStatus::Soumis)
                ->orderBy('created_at')
                ->get(),
        ]);
    }

    public function show(Preinscription $preinscription): Response
    {
        if ($preinscription->status === PreinscriptionStatus::Soumis && $preinscription->reviewed_at === null) {
            $preinscription->update(['reviewed_at' => now()]);
        }

        return Inertia::render('Admin/Preinscriptions/Show', [
            'preinscription' => $preinscription->load('filiere:id,nom_fr'),
        ]);
    }

    public function approve(Preinscription $preinscription): RedirectResponse
    {
        abort_if($preinscription->status !== PreinscriptionStatus::Soumis, 409, 'Cette préinscription a déjà été traitée.');

        $user = $preinscription->user;
        $user->role = Role::Etudiant;
        if ($user->avatar_path === null) {
            $user->avatar_path = $preinscription->photo_path;
        }
        $user->save();
        $user->syncRoles([Role::Etudiant->spatieRole()]);

        $matricule = Etudiant::generateMatricule();

        Etudiant::create([
            'user_id' => $user->id,
            'preinscription_id' => $preinscription->id,
            'matricule' => $matricule,
            'statut' => StatutEtudiant::Actif,
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

    public function refuse(Request $request, Preinscription $preinscription): RedirectResponse
    {
        abort_if($preinscription->status !== PreinscriptionStatus::Soumis, 409, 'Cette préinscription a déjà été traitée.');

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
