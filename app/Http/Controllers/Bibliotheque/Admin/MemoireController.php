<?php

namespace App\Http\Controllers\Bibliotheque\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bibliotheque\StoreMemoireRequest;
use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Filiere;
use App\Models\Bibliotheque\Memoire;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MemoireController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Bibliotheque/Admin/Memoires/Index', [
            'memoires' => Memoire::query()->with(['filiere', 'annee'])->latest()->get()->map(fn (Memoire $m) => [
                'id' => $m->id,
                'titre' => $m->titre,
                'auteur' => $m->auteur,
                'categorie' => $m->categorie->value,
                'filiere' => $m->filiere->nom,
                'annee' => $m->annee->libelle,
            ]),
            'filieresList' => Filiere::query()->with('mention')->orderBy('nom')->get()->map(fn (Filiere $f) => [
                'id' => $f->id,
                'label' => "{$f->nom} ({$f->niveau->value})",
            ]),
            'annees' => AnneeUniversitaire::query()->orderByDesc('libelle')->get(['id', 'libelle']),
        ]);
    }

    public function store(StoreMemoireRequest $request): RedirectResponse
    {
        $file = $request->file('fichier');

        Memoire::create([
            ...$request->safe()->except('fichier'),
            'chemin_fichier' => $file->store('memoires', 'local'),
        ]);

        return back()->with('status', 'Mémoire ajouté.');
    }

    public function destroy(Memoire $memoire): RedirectResponse
    {
        Storage::disk('local')->delete($memoire->chemin_fichier);
        $memoire->delete();

        return back()->with('status', 'Mémoire supprimé.');
    }
}
