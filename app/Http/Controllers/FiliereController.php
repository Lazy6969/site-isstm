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
            'filieres' => Filiere::orderBy('display_order')
                ->get(['slug', 'mention', 'niveaux', 'nom_fr', 'nom_en', 'nom_mg', 'description_fr', 'description_en', 'description_mg', 'image_path'])
                ->map(fn (Filiere $item) => [
                    'slug' => $item->slug,
                    'mention' => $item->mention,
                    'niveaux' => $item->niveaux,
                    'nom' => $item->localized('nom'),
                    'description' => $item->localized('description'),
                    'image_path' => $item->image_path,
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
                'nom' => $filiere->localized('nom'),
                'description' => $filiere->localized('description'),
                'debouches' => $filiere->localized('debouches'),
                'historique' => $filiere->localized('historique'),
                'avantages' => $filiere->localized('avantages'),
                'image_path' => $filiere->image_path,
            ],
        ]);
    }
}
