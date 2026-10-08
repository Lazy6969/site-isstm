<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClasseRequest;
use App\Models\Candidat;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\PreinscriptionStatus;
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
            'membres' => $this->membres(),
        ]);
    }

    /**
     * Everyone who belongs to a niveau, validated or not: the enrolled students
     * (their class, or the niveau they chose in the form when none is set yet)
     * and the candidates whose pré-inscription is still being processed. A
     * candidate leaves the second group the moment the dossier is accepted —
     * the student record takes over, so nobody is listed twice.
     *
     * @return array<int, array{key: string, type: string, nom: string, email: ?string, niveau: ?string, filiere: ?string, reference: ?string, statut: string, href: string}>
     */
    private function membres(): array
    {
        $etudiants = Etudiant::with(['user:id,name,email', 'classe.filiere:id,nom_fr', 'candidat.filiere:id,nom_fr'])
            ->get()
            ->map(fn (Etudiant $etudiant) => [
                'key' => "etudiant-{$etudiant->id}",
                'type' => 'etudiant',
                'nom' => $etudiant->user->name,
                'email' => $etudiant->user->email,
                'niveau' => $etudiant->classe?->niveau ?? $etudiant->candidat?->niveau,
                'filiere' => $etudiant->classe?->filiere?->nom_fr ?? $etudiant->candidat?->filiere?->nom_fr,
                'reference' => $etudiant->matricule,
                'statut' => $etudiant->statut->value,
                'href' => "/console/scolarite/etudiants/{$etudiant->id}",
            ]);

        $preinscrits = Candidat::with('filiere:id,nom_fr')
            ->whereIn('status', [PreinscriptionStatus::Soumis, PreinscriptionStatus::EnExamen, PreinscriptionStatus::ACompleter])
            ->doesntHave('etudiant')
            ->get()
            ->map(fn (Candidat $candidat) => [
                'key' => "candidat-{$candidat->id}",
                'type' => 'preinscrit',
                'nom' => trim("{$candidat->nom} {$candidat->prenoms}"),
                'email' => $candidat->email,
                'niveau' => $candidat->niveau,
                'filiere' => $candidat->filiere?->nom_fr,
                'reference' => $candidat->numero_dossier,
                'statut' => $candidat->status->value,
                'href' => "/console/preinscriptions/{$candidat->id}",
            ]);

        return $etudiants->concat($preinscrits)->sortBy('nom', SORT_NATURAL | SORT_FLAG_CASE)->values()->all();
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
