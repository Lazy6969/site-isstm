<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use Inertia\Inertia;
use Inertia\Response;

class FiliereController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Filieres/Index', [
            'filieres' => Filiere::orderBy('display_order')->get([
                'slug', 'mention', 'niveaux', 'nom_fr as nom', 'description_fr as description', 'image_path',
            ]),
        ]);
    }

    public function show(Filiere $filiere): Response
    {
        return Inertia::render('Filieres/Show', [
            'filiere' => [
                'slug' => $filiere->slug,
                'code' => $filiere->code,
                'mention' => $filiere->mention,
                'niveaux' => $filiere->niveaux,
                'nom' => $filiere->nom_fr,
                'description' => $filiere->description_fr,
                'debouches' => $filiere->debouches_fr,
                'historique' => $filiere->historique_fr,
                'avantages' => $filiere->avantages_fr,
                'image_path' => $filiere->image_path,
            ],
        ]);
    }
}
