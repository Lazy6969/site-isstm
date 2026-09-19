<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClasseRequest;
use App\Models\Classe;
use App\Models\Filiere;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClasseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Scolarite/Classes/Index', [
            'classes' => Classe::with('filiere:id,nom_fr')
                ->withCount('etudiants')
                ->orderBy('annee', 'desc')
                ->orderBy('niveau')
                ->orderBy('nom')
                ->get(),
            'filieres' => Filiere::orderBy('nom_fr')->get(['id', 'nom_fr']),
        ]);
    }

    public function store(StoreClasseRequest $request): RedirectResponse
    {
        $classe = Classe::create($request->validated());

        return back()->with('status', "Classe « {$classe->nom} » créée.");
    }

    public function update(Request $request, Classe $classe): RedirectResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'filiere_id' => ['required', 'exists:filieres,id'],
            'niveau' => ['required', 'string', 'max:10'],
            'annee' => ['required', 'string', 'max:20'],
            'effectif_max' => ['nullable', 'integer', 'min:1'],
        ]);

        $classe->update($validated);

        return back()->with('status', "Classe « {$classe->nom} » mise à jour.");
    }

    public function destroy(Classe $classe): RedirectResponse
    {
        abort_if($classe->etudiants()->exists(), 409, 'Impossible de supprimer une classe qui a des étudiants.');

        $classe->delete();

        return back()->with('status', 'Classe supprimée.');
    }
}
