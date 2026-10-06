<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEtudiantRequest;
use App\Models\ActivityLog;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\User;
use App\Role;
use App\StatutEtudiant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EtudiantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Scolarite/Etudiants/Index', [
            'etudiants' => Etudiant::with(['user:id,name,email', 'classe:id,nom,niveau,annee'])
                ->orderBy('matricule')
                ->get(),
            'classes' => Classe::orderBy('nom')->get(['id', 'nom', 'niveau', 'annee']),
            'eligibleUsers' => User::query()
                ->where('role', Role::Etudiant)
                ->doesntHave('etudiant')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    public function show(Etudiant $etudiant): Response
    {
        $etudiant->load(['user', 'classe.filiere', 'candidat', 'inscriptions.classe']);

        return Inertia::render('Admin/Scolarite/Etudiants/Show', [
            'etudiant' => $etudiant,
        ]);
    }

    public function store(StoreEtudiantRequest $request): RedirectResponse
    {
        $etudiant = Etudiant::create($request->validated());

        return back()->with('status', "Dossier étudiant créé (matricule {$etudiant->matricule}).");
    }

    public function update(Request $request, Etudiant $etudiant): RedirectResponse
    {
        $validated = $request->validate([
            'classe_id' => ['nullable', 'exists:classes,id'],
            'matricule' => ['required', 'string', 'max:50', Rule::unique('etudiants', 'matricule')->ignore($etudiant->id)],
            'statut' => ['required', Rule::enum(StatutEtudiant::class)],
            'telephone' => ['nullable', 'string', 'max:30'],
            'adresse' => ['nullable', 'string', 'max:255'],
        ]);

        $wasActive = $etudiant->user->is_active;

        $etudiant->update($validated);

        // `is_active` is deliberately excluded from User's #[Fillable] list, so
        // it's set via direct property assignment, not mass assignment.
        $etudiant->user->is_active = $etudiant->statut === StatutEtudiant::Actif;
        $etudiant->user->save();

        if ($wasActive && ! $etudiant->user->is_active) {
            $this->forceLogout([$etudiant->user_id]);
        }

        return back()->with('status', "Dossier de {$etudiant->user->name} mis à jour.");
    }

    /**
     * One-click suspend/resume, toggling both the dossier's `statut` and the
     * linked account's `is_active` together — a suspended student can no
     * longer log in (LoginRequest) and is pointed at the self-service
     * reactivation page (ReactivationRequestController) instead of being
     * told to contact an admin. Left to Diplome/Abandon transitions, which
     * carry their own meaning and go through the full edit form instead.
     */
    public function togglePause(Etudiant $etudiant): RedirectResponse
    {
        abort_if(
            ! in_array($etudiant->statut, [StatutEtudiant::Actif, StatutEtudiant::Suspendu], true),
            409,
            'Seuls les dossiers actifs ou suspendus peuvent être mis en pause ou réactivés ainsi.',
        );

        $suspending = $etudiant->statut === StatutEtudiant::Actif;

        $etudiant->update(['statut' => $suspending ? StatutEtudiant::Suspendu : StatutEtudiant::Actif]);

        $etudiant->user->is_active = ! $suspending;
        $etudiant->user->save();

        // is_active only gates future login attempts (LoginRequest) — without
        // this, a student already logged in before being paused would keep
        // their access until the session expires on its own.
        if ($suspending) {
            $this->forceLogout([$etudiant->user_id]);
        }

        ActivityLog::record(
            $suspending ? 'etudiant_suspendu' : 'etudiant_reactive',
            ($suspending ? 'Compte suspendu : ' : 'Compte réactivé : ').$etudiant->user->name,
            $etudiant,
        );

        return back()->with('status', $suspending
            ? "Compte de {$etudiant->user->name} mis en pause."
            : "Compte de {$etudiant->user->name} réactivé.");
    }

    /**
     * Suspends every currently active étudiant dossier in one action — e.g.
     * at the end of an academic year, before the next re-registration
     * campaign. Bulk `update()` calls here go through the query builder, not
     * a model instance, so they bypass User's #[Fillable] guard entirely
     * (unlike togglePause()'s single-record case above) — exactly what's
     * wanted for a column that's never meant to be mass-assignable from
     * user-supplied input, which this bulk action isn't.
     */
    public function pauseAll(): RedirectResponse
    {
        $etudiants = Etudiant::where('statut', StatutEtudiant::Actif)->get(['id', 'user_id']);

        if ($etudiants->isEmpty()) {
            return back()->with('status', 'Aucun compte étudiant actif à mettre en pause.');
        }

        Etudiant::whereIn('id', $etudiants->pluck('id'))->update(['statut' => StatutEtudiant::Suspendu]);
        User::whereIn('id', $etudiants->pluck('user_id'))->update(['is_active' => false]);
        $this->forceLogout($etudiants->pluck('user_id')->all());

        ActivityLog::record('etudiants_pause_globale', "Mise en pause groupée de {$etudiants->count()} compte(s) étudiant(s).");

        return back()->with('status', "{$etudiants->count()} compte(s) étudiant(s) mis en pause.");
    }

    /**
     * Deletes the student's whole account, not just the dossier — every foreign
     * key that touches `users` cascades from there (etudiant, inscriptions,
     * posts, messages, friend requests, notifications, etc.), so the account
     * stops working and none of their data survives. This is deliberately not
     * a soft delete: there's no other path in the app to reach a "removed"
     * student, and an admin choosing this action means it for good.
     */
    public function destroy(Etudiant $etudiant): RedirectResponse
    {
        $user = $etudiant->user;
        $name = $user->name;

        $user->delete();

        return redirect()->route('admin.scolarite.etudiants.index')->with('status', "Le compte de {$name} et toutes ses données ont été supprimés.");
    }

    /**
     * Deletes the given users' session rows outright (the `database` session
     * driver backing this app) rather than anything token-based — there's no
     * "log this other user out" API otherwise, since Laravel's own
     * logoutOtherDevices() only works for the currently authenticated user's
     * own browser. Their next request with that cookie simply finds no
     * matching session and is treated as a guest.
     *
     * @param  array<int, int>  $userIds
     */
    private function forceLogout(array $userIds): void
    {
        DB::table('sessions')->whereIn('user_id', $userIds)->delete();
    }
}
