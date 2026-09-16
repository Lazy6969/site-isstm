<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Preinscription;
use App\Models\User;
use App\PreinscriptionStatus;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PreinscriptionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Preinscriptions/Index', [
            'preinscriptions' => Preinscription::with('filiere:id,nom_fr')
                ->where('status', PreinscriptionStatus::EnAttente)
                ->orderBy('created_at')
                ->get(),
        ]);
    }

    public function approve(Preinscription $preinscription): RedirectResponse
    {
        abort_if($preinscription->status === PreinscriptionStatus::Approuve, 409, 'Cette préinscription a déjà été approuvée.');

        $user = User::create([
            'name' => trim("{$preinscription->nom} {$preinscription->prenoms}"),
            'email' => $preinscription->email,
            'password' => Hash::make(Str::random(32)),
            'role' => Role::Etudiant,
            'avatar_path' => $preinscription->photo_path,
        ]);

        $preinscription->status = PreinscriptionStatus::Approuve;
        $preinscription->user_id = $user->id;
        $preinscription->save();

        Password::sendResetLink(['email' => $user->email]);

        return back()->with('status', "Compte étudiant créé pour {$user->name}. Un e-mail pour définir son mot de passe vient d'être envoyé.");
    }
}
