<?php

namespace App\Http\Controllers\Materiel;

use App\Http\Controllers\Controller;
use App\MaterielMouvementType;
use App\Models\MaterielMouvement;
use Inertia\Inertia;
use Inertia\Response;

class HistoriqueController extends Controller
{
    public function index(): Response
    {
        $mouvements = MaterielMouvement::with(['materiel:id,code,nom', 'user:id,name'])
            ->latest('created_at')
            ->latest('id')
            ->limit(500)
            ->get();

        return Inertia::render('Materiel/Historique/Index', [
            'mouvements' => $mouvements->map(fn (MaterielMouvement $mouvement) => [
                'id' => $mouvement->id,
                'type' => $mouvement->type->value,
                'label' => $mouvement->type->label(),
                'de' => $mouvement->de,
                'vers' => $mouvement->vers,
                'note' => $mouvement->note,
                'user' => $mouvement->user?->name,
                'materiel' => ['id' => $mouvement->materiel?->id, 'code' => $mouvement->materiel?->code, 'nom' => $mouvement->materiel?->nom],
                'created_at' => $mouvement->created_at,
            ])->values(),
            'types' => collect(MaterielMouvementType::cases())->mapWithKeys(fn (MaterielMouvementType $type) => [$type->value => $type->label()])->all(),
        ]);
    }
}
