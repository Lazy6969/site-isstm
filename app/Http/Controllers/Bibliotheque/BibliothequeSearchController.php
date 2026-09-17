<?php

namespace App\Http\Controllers\Bibliotheque;

use App\Http\Controllers\Controller;
use App\Models\Bibliotheque\Canevas;
use App\Models\Bibliotheque\Memoire;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BibliothequeSearchController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->string('q'));

        $canevas = collect();
        $memoires = collect();

        if ($query !== '') {
            $canevas = Canevas::query()
                ->with('annee')
                ->where('titre', 'like', "%{$query}%")
                ->limit(30)
                ->get()
                ->map(fn (Canevas $c) => [
                    'id' => $c->id,
                    'titre' => $c->titre,
                    'niveau' => $c->niveau->value,
                    'annee' => $c->annee->libelle,
                ]);

            $memoires = Memoire::query()
                ->with('filiere')
                ->where(fn ($q) => $q->where('titre', 'like', "%{$query}%")->orWhere('auteur', 'like', "%{$query}%"))
                ->limit(30)
                ->get()
                ->map(fn (Memoire $m) => [
                    'id' => $m->id,
                    'titre' => $m->titre,
                    'auteur' => $m->auteur,
                    'categorie' => $m->categorie->value,
                    'filiere' => $m->filiere->nom,
                ]);
        }

        return Inertia::render('Bibliotheque/Recherche', [
            'query' => $query,
            'canevas' => $canevas,
            'memoires' => $memoires,
        ]);
    }
}
