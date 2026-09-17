<?php

namespace App\Http\Controllers\Bibliotheque\Admin;

use App\BibliothequeFileType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Bibliotheque\StoreCanevasRequest;
use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Canevas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CanevasController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Bibliotheque/Admin/Canevas/Index', [
            'canevas' => Canevas::query()->with('annee')->latest()->get()->map(fn (Canevas $c) => [
                'id' => $c->id,
                'titre' => $c->titre,
                'niveau' => $c->niveau->value,
                'annee' => $c->annee->libelle,
                'type_fichier' => $c->type_fichier->value,
            ]),
            'annees' => AnneeUniversitaire::query()->orderByDesc('libelle')->get(['id', 'libelle']),
        ]);
    }

    public function store(StoreCanevasRequest $request): RedirectResponse
    {
        $file = $request->file('fichier');
        $type = BibliothequeFileType::fromExtension($file->getClientOriginalExtension());

        Canevas::create([
            ...$request->safe()->except('fichier'),
            'type_fichier' => $type,
            'chemin_fichier' => $file->store('canevas', 'local'),
        ]);

        return back()->with('status', 'Canevas ajouté.');
    }

    public function destroy(Canevas $canevas): RedirectResponse
    {
        Storage::disk('local')->delete($canevas->chemin_fichier);
        $canevas->delete();

        return back()->with('status', 'Canevas supprimé.');
    }
}
