<?php

namespace App\Http\Controllers;

use App\EvenementStatus;
use App\Models\Evenement;
use Inertia\Inertia;
use Inertia\Response;

class EvenementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Evenements/Index', [
            'evenements' => Evenement::query()
                ->where('date_debut', '>=', now())
                ->where('status', EvenementStatus::Publie)
                ->orderBy('date_debut')
                ->get(['id', 'titre', 'description', 'date_debut', 'lieu', 'image_path', 'categorie']),
        ]);
    }
}
