<?php

namespace App\Http\Controllers\Bibliotheque;

use App\CanevasNiveau;
use App\Http\Controllers\Controller;
use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Canevas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CanevasController extends Controller
{
    public function index(Request $request): Response
    {
        $canevas = Canevas::query()
            ->with('annee')
            ->when($request->filled('niveau'), fn ($query) => $query->where('niveau', $request->string('niveau')))
            ->when($request->filled('annee_id'), fn ($query) => $query->where('annee_id', $request->integer('annee_id')))
            ->latest()
            ->get()
            ->map(fn (Canevas $c) => [
                'id' => $c->id,
                'titre' => $c->titre,
                'niveau' => $c->niveau->value,
                'annee' => $c->annee->libelle,
                'type_fichier' => $c->type_fichier->value,
                'icon' => $c->type_fichier->icon(),
            ]);

        return Inertia::render('Bibliotheque/Canevas/Index', [
            'canevas' => $canevas,
            'niveaux' => array_map(fn (CanevasNiveau $n) => $n->value, CanevasNiveau::cases()),
            'annees' => AnneeUniversitaire::query()->orderByDesc('libelle')->get(['id', 'libelle']),
            'filters' => $request->only(['niveau', 'annee_id']),
        ]);
    }

    public function download(Canevas $canevas): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($canevas->chemin_fichier), 404);

        return Storage::disk('local')->download($canevas->chemin_fichier, $canevas->titre.'.'.pathinfo($canevas->chemin_fichier, PATHINFO_EXTENSION));
    }
}
