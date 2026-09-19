<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInscriptionRequest;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Inscription;
use App\StatutInscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InscriptionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Scolarite/Inscriptions/Index', [
            'inscriptions' => Inscription::with(['etudiant.user:id,name', 'classe:id,nom,niveau'])
                ->orderBy('annee', 'desc')
                ->orderBy('created_at', 'desc')
                ->get(),
            'etudiants' => Etudiant::with('user:id,name')->orderBy('matricule')->get(['id', 'user_id', 'matricule']),
            'classes' => Classe::orderBy('nom')->get(['id', 'nom', 'niveau', 'annee']),
        ]);
    }

    public function store(StoreInscriptionRequest $request): RedirectResponse
    {
        $inscription = Inscription::create($request->validated());

        return back()->with('status', "Inscription {$inscription->annee} enregistrée.");
    }

    public function update(Request $request, Inscription $inscription): RedirectResponse
    {
        $validated = $request->validate([
            'statut' => ['required', Rule::enum(StatutInscription::class)],
            'numero' => ['nullable', 'string', 'max:50'],
        ]);

        $inscription->update($validated);

        return back()->with('status', 'Inscription mise à jour.');
    }

    public function destroy(Inscription $inscription): RedirectResponse
    {
        $inscription->delete();

        return back()->with('status', 'Inscription supprimée.');
    }
}
