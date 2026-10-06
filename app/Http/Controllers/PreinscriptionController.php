<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePreinscriptionAccountRequest;
use App\Http\Requests\SubmitPreinscriptionRequest;
use App\Http\Requests\UpdatePreinscriptionDraftRequest;
use App\Models\Candidat;
use App\Models\Filiere;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\PreinscriptionReceived;
use App\Notifications\PreinscriptionSubmitted;
use App\PreinscriptionStatus;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PreinscriptionController extends Controller
{
    /**
     * The wizard itself. `initialStep` is resolved here rather than guessed in
     * the browser: the page reloads in full whenever the built assets change
     * under an open tab (Inertia's asset-version check), and a step held only
     * in React state would silently rewind the candidate to the first screen.
     */
    public function create(): Response|RedirectResponse
    {
        // Already a full student account: the form would only let them open a
        // second, unrelated dossier. Sent back with a word on why, rather than
        // silently handed a wizard they have no real use for.
        if (Auth::user()?->role === Role::Etudiant) {
            return redirect()->route('rejoindre')->with('status', 'Vous êtes déjà inscrit(e) en tant qu’étudiant.');
        }

        $candidat = Auth::check()
            ? Auth::user()->candidats()->latest('created_at')->first()
            : null;

        // Already sent a dossier in: the form would only offer to open a second
        // account they can't use. Their dossier's own page is what they want,
        // with a word on why they were sent there rather than to the form.
        if ($candidat !== null && ! in_array($candidat->status, [PreinscriptionStatus::Brouillon, PreinscriptionStatus::ACompleter], true)) {
            return redirect()->route('preinscription.dossier')
                ->with('status', 'Votre dossier a déjà été envoyé : il n’est plus modifiable. Vous pouvez suivre son avancement sur cette page.');
        }

        // No draft to resume and registrations are closed: a brand new
        // candidate has nothing to open right now. Someone already mid-draft
        // above is let through regardless, so closing registrations never
        // strands an in-progress dossier.
        if ($candidat === null && Setting::get('inscriptions.closed', 'false') === 'true') {
            return redirect()->route('rejoindre')->with(
                'status',
                Setting::get('inscriptions.closed_message') ?: 'Les inscriptions sont actuellement fermées.',
            );
        }

        return Inertia::render('Preinscription/Create', [
            'filieres' => Filiere::orderBy('display_order')->get(['id', 'nom_fr as nom', 'niveaux']),
            'draft' => $candidat,
            'initialStep' => $this->stepFor($candidat),
        ]);
    }

    /**
     * Where to reopen the wizard, read off what the dossier already holds.
     * A full page reload can land here at any moment (Inertia reloads the page
     * outright when the built assets change under an open tab), so resuming
     * must not throw the candidate back to an earlier step than they reached.
     */
    private function stepFor(?Candidat $candidat): string
    {
        return match (true) {
            $candidat === null => 'identite',
            $candidat->filiere_id !== null && $candidat->niveau !== null => 'validation',
            $candidat->contact_parents !== null || $candidat->repondant_telephone !== null => 'formation',
            default => 'famille',
        };
    }

    /**
     * First step of the wizard: creates the candidate's account and opens a
     * Brouillon dossier so the rest of the wizard has something to save
     * progress against. The account gets an unusable random password — the
     * candidate never types one. No e-mail goes out here on purpose: a
     * candidate who abandons the wizard before finishing all 4 steps should
     * never receive anything — see submit() below, where both the
     * password-setup link and the verification e-mail fire together once the
     * dossier is actually complete. Logs the candidate in immediately so the
     * wizard itself never requires a password in the meantime.
     */
    public function storeAccount(StorePreinscriptionAccountRequest $request): RedirectResponse
    {
        try {
            $preinscription = DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => trim("{$request->nom} {$request->prenoms}"),
                    'email' => $request->email,
                    'password' => Str::password(40),
                    'role' => Role::User,
                ]);

                // The whole Identité step is saved here, not just the five
                // account fields: the candidate already typed the rest, and a
                // full page reload right after this would otherwise wipe it.
                return Candidat::create([
                    ...$request->safe()->only([
                        'nom', 'prenoms', 'civilite', 'sexe', 'email',
                        'date_naissance', 'lieu_naissance', 'nationalite', 'pays', 'cin', 'telephone', 'adresse',
                    ]),
                    'user_id' => $user->id,
                    'status' => PreinscriptionStatus::Brouillon,
                ]);
            });
        } catch (Throwable $e) {
            report($e);
            Log::error('preinscription.storeAccount: failed to create the candidate account', ['email' => $request->email, 'message' => $e->getMessage()]);

            return redirect()->route('preinscription.create')->withInput($request->all())
                ->with('error', "Une erreur est survenue et votre compte n'a pas pu être créé. Réessayez, ou contactez la scolarité si le problème persiste.");
        }

        Auth::login($preinscription->user);

        // Explicit target rather than back(): back() resolves from the
        // request's Referer header for Inertia/XHR visits, which is fragile
        // here — this redirect must always land the candidate on their own
        // wizard, not wherever the browser happened to report.
        return redirect()->route('preinscription.create');
    }

    /**
     * Saves whatever the candidate has filled in so far on their own
     * still-editable dossier — no files or identity fields are required here.
     */
    public function saveDraft(UpdatePreinscriptionDraftRequest $request, Candidat $preinscription): RedirectResponse
    {
        $data = $request->safe()->except(['photo', 'releve_bacc', 'cin_recto', 'cin_verso', 'diplome_attestation']);

        foreach (['photo' => 'photo_path', 'releve_bacc' => 'releve_bacc_path', 'cin_recto' => 'cin_recto_path', 'cin_verso' => 'cin_verso_path', 'diplome_attestation' => 'diplome_attestation_path'] as $field => $column) {
            if ($request->hasFile($field)) {
                $data[$column] = $request->file($field)->store('preinscriptions', 'public');
            }
        }

        $preinscription->update($data);

        return redirect()->route('preinscription.create')->with('status', 'Brouillon enregistré.');
    }

    /**
     * Finalizes the dossier: strict validation, generates the dossier number,
     * and notifies the scolarité — the same effect the old single-shot store()
     * had, just applied to an existing draft instead of creating everything at once.
     */
    public function submit(SubmitPreinscriptionRequest $request, Candidat $preinscription): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $preinscription) {
                $data = $request->safe()->except(['photo', 'releve_bacc', 'cin_recto', 'cin_verso', 'diplome_attestation']);

                foreach (['photo' => 'photo_path', 'releve_bacc' => 'releve_bacc_path', 'cin_recto' => 'cin_recto_path', 'cin_verso' => 'cin_verso_path', 'diplome_attestation' => 'diplome_attestation_path'] as $field => $column) {
                    if ($request->hasFile($field)) {
                        $data[$column] = $request->file($field)->store('preinscriptions', 'public');
                    }
                }

                $data['numero_dossier'] ??= Candidat::generateNumeroDossier();
                $data['status'] = PreinscriptionStatus::Soumis;
                $data['submitted_at'] = now();
                $data['commentaire_correction'] = null;

                $preinscription->update($data);
            });
        } catch (Throwable $e) {
            report($e);
            Log::error('preinscription.submit: failed to save the dossier', ['preinscription_id' => $preinscription->id, 'message' => $e->getMessage()]);

            return redirect()->route('preinscription.create')->withInput($request->all())
                ->with('error', "Une erreur est survenue et votre dossier n'a pas pu être enregistré. Réessayez, ou contactez la scolarité si le problème persiste.");
        }

        Log::info('preinscription.submit: dossier submitted', ['preinscription_id' => $preinscription->id, 'email' => $preinscription->email]);

        $user = $preinscription->user;

        // The only e-mail the candidate gets at this point — see
        // PreinscriptionReceived's own docblock for why no password-setup
        // link goes out here (that's PreinscriptionAccepted's job, later).
        try {
            $user->notify(new PreinscriptionReceived($preinscription));
        } catch (Throwable $e) {
            report($e);
        }

        try {
            Notification::send(User::permission('preinscriptions.manage')->get(), new PreinscriptionSubmitted($preinscription));
        } catch (Throwable $e) {
            report($e);
        }

        // Straight to the dossier itself — no verification detour: the
        // candidate is already logged in (storeAccount() did that), and
        // /mon-dossier no longer requires a verified e-mail (see routes/web.php).
        return redirect()->route('preinscription.dossier')
            ->with('status', 'Votre dossier a bien été envoyé et enregistré. Un e-mail de confirmation vient de vous être envoyé.');
    }

    public function dossier(Request $request): Response
    {
        $preinscription = $request->user()->candidats()
            ->with(['filiere:id,nom_fr', 'etudiant:id,candidat_id,matricule'])
            ->latest('created_at')
            ->firstOrFail();

        return Inertia::render('Preinscription/Dossier', [
            'preinscription' => $preinscription,
        ]);
    }
}
