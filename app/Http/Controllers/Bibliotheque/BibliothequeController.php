<?php

namespace App\Http\Controllers\Bibliotheque;

use App\Http\Controllers\Controller;
use App\Models\Bibliotheque\Canevas;
use App\Models\Bibliotheque\Memoire;
use Inertia\Inertia;
use Inertia\Response;

class BibliothequeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Bibliotheque/Index', [
            'derniersCanevas' => Canevas::query()->with('annee')->latest()->limit(5)->get()->map(fn (Canevas $c) => [
                'id' => $c->id,
                'titre' => $c->titre,
                'niveau' => $c->niveau->value,
                'annee' => $c->annee->libelle,
            ]),
            'derniersMemoires' => Memoire::query()->with('filiere')->latest()->limit(5)->get()->map(fn (Memoire $m) => [
                'id' => $m->id,
                'titre' => $m->titre,
                'auteur' => $m->auteur,
                'categorie' => $m->categorie->value,
                'filiere' => $m->filiere->nom,
            ]),
        ]);
    }
}
