<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePreinscriptionRequest;
use App\Models\Filiere;
use App\Models\Preinscription;
use App\Models\User;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PreinscriptionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Preinscription/Create', [
            'filieres' => Filiere::orderBy('display_order')->get(['id', 'nom_fr as nom', 'niveaux']),
        ]);
    }

    public function store(StorePreinscriptionRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => trim("{$request->nom} {$request->prenoms}"),
                'email' => $request->email,
                'password' => $request->password,
                'role' => Role::User,
            ]);

            Preinscription::create([
                ...$request->safe()->except([
                    'photo', 'releve_bacc', 'cin_recto', 'cin_verso', 'diplome_attestation',
                    'password', 'password_confirmation',
                ]),
                'photo_path' => $request->file('photo')->store('preinscriptions', 'public'),
                'releve_bacc_path' => $request->file('releve_bacc')->store('preinscriptions', 'public'),
                'cin_recto_path' => $request->file('cin_recto')->store('preinscriptions', 'public'),
                'cin_verso_path' => $request->file('cin_verso')->store('preinscriptions', 'public'),
                'diplome_attestation_path' => $request->file('diplome_attestation')->store('preinscriptions', 'public'),
                'user_id' => $user->id,
            ]);

            return $user;
        });

        try {
            $user->sendEmailVerificationNotification();
        } catch (Throwable $e) {
            report($e);
        }

        Auth::login($user);

        // A brand-new candidate account is never verified yet — send them straight to
        // the "check your inbox" page instead of /mon-dossier, which the `verified`
        // middleware would otherwise bounce them away from anyway.
        return redirect()->route('verification.notice')
            ->with('status', 'Votre préinscription a bien été envoyée. Vérifiez votre boîte mail pour activer votre compte et suivre votre dossier.');
    }

    public function dossier(Request $request): Response
    {
        $preinscription = $request->user()->preinscriptions()
            ->with(['filiere:id,nom_fr', 'etudiant:id,preinscription_id,matricule'])
            ->latest('created_at')
            ->firstOrFail();

        return Inertia::render('Preinscription/Dossier', [
            'preinscription' => $preinscription,
        ]);
    }
}
