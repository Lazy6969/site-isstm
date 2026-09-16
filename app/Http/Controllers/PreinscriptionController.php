<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePreinscriptionRequest;
use App\Models\Filiere;
use App\Models\Preinscription;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

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
        $preinscription = Preinscription::create([
            ...$request->safe()->except('photo'),
            'photo_path' => $request->file('photo')->store('preinscriptions', 'public'),
        ]);

        return redirect()->route('preinscription.create')
            ->with('status', "Votre préinscription a bien été envoyée. Vous recevrez une réponse par e-mail après étude de votre dossier (référence #{$preinscription->id}).");
    }
}
