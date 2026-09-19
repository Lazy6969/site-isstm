<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEtudiantRequest;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\User;
use App\Role;
use App\StatutEtudiant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EtudiantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Scolarite/Etudiants/Index', [
            'etudiants' => Etudiant::with(['user:id,name,email', 'classe:id,nom,niveau,annee'])
                ->orderBy('matricule')
                ->get(),
            'classes' => Classe::orderBy('nom')->get(['id', 'nom', 'niveau', 'annee']),
            'eligibleUsers' => User::query()
                ->where('role', Role::Etudiant)
                ->doesntHave('etudiant')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    public function show(Etudiant $etudiant): Response
    {
        $etudiant->load(['user', 'classe.filiere', 'preinscription', 'inscriptions.classe']);

        return Inertia::render('Admin/Scolarite/Etudiants/Show', [
            'etudiant' => $etudiant,
        ]);
    }

    public function store(StoreEtudiantRequest $request): RedirectResponse
    {
        $etudiant = Etudiant::create($request->validated());

        return back()->with('status', "Dossier étudiant créé (matricule {$etudiant->matricule}).");
    }

    public function update(Request $request, Etudiant $etudiant): RedirectResponse
    {
        $validated = $request->validate([
            'classe_id' => ['nullable', 'exists:classes,id'],
            'matricule' => ['required', 'string', 'max:50', Rule::unique('etudiants', 'matricule')->ignore($etudiant->id)],
            'statut' => ['required', Rule::enum(StatutEtudiant::class)],
        ]);

        $etudiant->update($validated);

        return back()->with('status', "Dossier de {$etudiant->user->name} mis à jour.");
    }
}
