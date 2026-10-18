<?php

namespace App\Http\Controllers\Materiel;

use App\Http\Controllers\Controller;
use App\Models\MaterielIntervention;
use Inertia\Inertia;
use Inertia\Response;

class InterventionController extends Controller
{
    public function index(): Response
    {
        $interventions = MaterielIntervention::with(['materiel:id,code,nom,categorie,statut', 'signaleur:id,name'])
            ->latest('date_debut')
            ->latest('id')
            ->limit(1000)
            ->get();

        return Inertia::render('Materiel/Interventions/Index', [
            'interventions' => $interventions->map(fn (MaterielIntervention $intervention) => [
                ...MaterielController::presentIntervention($intervention),
                'materiel' => [
                    'id' => $intervention->materiel?->id,
                    'code' => $intervention->materiel?->code,
                    'nom' => $intervention->materiel?->nom,
                    'categorie' => $intervention->materiel?->categorie,
                ],
            ])->values(),
            'options' => MaterielController::options(),
            'stats' => [
                'ouvertes' => MaterielIntervention::ouvertes()->count(),
                'cout_total' => (int) MaterielIntervention::sum('cout'),
            ],
        ]);
    }
}
