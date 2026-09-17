<?php

namespace App\Http\Controllers\Bibliotheque\Admin;

use App\Http\Controllers\Controller;
use App\MemoireCategorie;
use App\Models\Bibliotheque\Canevas;
use App\Models\Bibliotheque\Filiere;
use App\Models\Bibliotheque\Memoire;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Bibliotheque/Admin/Dashboard', [
            'stats' => [
                'canevas' => Canevas::query()->count(),
                'memoires' => Memoire::query()->where('categorie', MemoireCategorie::Memoire)->count(),
                'projets' => Memoire::query()->where('categorie', MemoireCategorie::Projet)->count(),
                'filieres' => Filiere::query()->count(),
            ],
        ]);
    }
}
