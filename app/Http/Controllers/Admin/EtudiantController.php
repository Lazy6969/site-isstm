<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEtudiantRequest;
use App\Models\Candidat;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\User;
use App\Role;
use App\StatutEtudiant;
use App\XlsxWriter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EtudiantController extends Controller
{
    private const NIVEAU_ORDER = ['L1', 'L2', 'L3', 'M1', 'M2'];

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);

        return Inertia::render('Admin/Scolarite/Etudiants/Index', [
            'etudiants' => $this->filteredEtudiants($filters)
                ->each(function (Etudiant $etudiant) {
                    $etudiant->setAttribute('filiere_nom', $this->filiereOf($etudiant));
                    $etudiant->setAttribute('niveau_code', $this->niveauOf($etudiant));
                }),
            'filters' => $filters,
            'filieres' => Filiere::orderBy('nom_fr')->get(['id', 'nom_fr']),
            'niveaux' => $this->niveaux(),
            'classes' => Classe::orderBy('nom')->get(['id', 'nom', 'niveau', 'annee']),
            'eligibleUsers' => User::query()
                ->where('role', Role::Etudiant)
                ->doesntHave('etudiant')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * The students matching the list's filters, as an Excel workbook — the same
     * rows the page shows, so what the scolarité exports is what it sees.
     */
    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->filters($request);

        $rows = $this->filteredEtudiants($filters)->map(fn (Etudiant $etudiant) => [
            $etudiant->matricule,
            $etudiant->nom ?? $etudiant->user->name,
            $etudiant->prenoms,
            $etudiant->civilite,
            $etudiant->sexe === 'F' ? 'Féminin' : ($etudiant->sexe === 'M' ? 'Masculin' : null),
            $etudiant->date_naissance?->format('d/m/Y'),
            $etudiant->lieu_naissance,
            $etudiant->nationalite,
            $etudiant->cin,
            $etudiant->telephone,
            $etudiant->user->email,
            $etudiant->adresse,
            $etudiant->contact_parents,
            $this->filiereOf($etudiant),
            $this->niveauOf($etudiant),
            $etudiant->classe?->annee,
            $etudiant->statut->label(),
        ]);

        $parts = array_filter([
            'etudiants',
            $filters['filiere_id'] ? Filiere::whereKey($filters['filiere_id'])->value('code') : null,
            $filters['niveau'],
            now()->format('Y-m-d'),
        ]);
        $filename = preg_replace('/[^A-Za-z0-9._-]+/', '-', implode('_', $parts)).'.xlsx';

        return XlsxWriter::download($filename, 'Étudiants', [
            'Matricule', 'Nom', 'Prénom(s)', 'Civilité', 'Genre', 'Date de naissance', 'Lieu de naissance', 'Nationalité', 'CIN / passeport',
            'Téléphone', 'E-mail', 'Adresse', 'Contact parents', 'Filière', 'Niveau', 'Année', 'Statut',
        ], $rows);
    }

    public function show(Etudiant $etudiant): Response
    {
        $etudiant->load(['user', 'classe.filiere', 'candidat.filiere', 'inscriptions.classe']);

        return Inertia::render('Admin/Scolarite/Etudiants/Show', [
            'etudiant' => $etudiant,
            'classes' => Classe::with('filiere:id,nom_fr')
                ->orderByDesc('annee')
                ->orderBy('niveau')
                ->get(['id', 'nom', 'niveau', 'annee', 'filiere_id']),
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
            'telephone' => ['nullable', 'string', 'max:30'],
            'adresse' => ['nullable', 'string', 'max:255'],
        ]);

        $etudiant->update($validated);

        return back()->with('status', "Dossier de {$etudiant->user->name} mis à jour.");
    }

    /**
     * Deletes the student's whole account, not just the dossier — every foreign
     * key that touches `users` cascades from there (etudiant, inscriptions,
     * posts, messages, friend requests, notifications, etc.), so the account
     * stops working and none of their data survives. This is deliberately not
     * a soft delete: there's no other path in the app to reach a "removed"
     * student, and an admin choosing this action means it for good.
     */
    public function destroy(Etudiant $etudiant): RedirectResponse
    {
        $user = $etudiant->user;
        $name = $user->name;

        $user->delete();

        return redirect()->route('admin.scolarite.etudiants.index')->with('status', "Le compte de {$name} et toutes ses données ont été supprimés.");
    }

    /**
     * @return array{filiere_id: ?int, niveau: ?string, statut: ?string, q: ?string}
     */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'filiere_id' => ['nullable', 'integer', 'exists:filieres,id'],
            'niveau' => ['nullable', 'string', 'max:10'],
            'statut' => ['nullable', Rule::enum(StatutEtudiant::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return [
            'filiere_id' => isset($validated['filiere_id']) ? (int) $validated['filiere_id'] : null,
            'niveau' => $validated['niveau'] ?? null,
            'statut' => $validated['statut'] ?? null,
            'q' => isset($validated['q']) && trim($validated['q']) !== '' ? trim($validated['q']) : null,
        ];
    }

    /**
     * @param  array{filiere_id: ?int, niveau: ?string, statut: ?string, q: ?string}  $filters
     * @return Collection<int, Etudiant>
     */
    private function filteredEtudiants(array $filters): Collection
    {
        return Etudiant::with([
            'user:id,name,email',
            'classe:id,nom,niveau,annee,filiere_id',
            'classe.filiere:id,nom_fr',
            'candidat:id,filiere_id,niveau',
            'candidat.filiere:id,nom_fr',
        ])
            ->filter($filters['filiere_id'], $filters['niveau'], $filters['statut'], $filters['q'])
            ->orderBy('matricule')
            ->get();
    }

    private function filiereOf(Etudiant $etudiant): ?string
    {
        return $etudiant->classe?->filiere?->nom_fr ?? $etudiant->candidat?->filiere?->nom_fr;
    }

    private function niveauOf(Etudiant $etudiant): ?string
    {
        return $etudiant->classe?->niveau ?? $etudiant->candidat?->niveau;
    }

    /**
     * Every niveau in use, L1 → M2 first and anything else after.
     *
     * @return array<int, string>
     */
    private function niveaux(): array
    {
        return Classe::query()->distinct()->pluck('niveau')
            ->merge(Candidat::query()->whereNotNull('niveau')->distinct()->pluck('niveau'))
            ->unique()
            ->sortBy(fn (string $niveau) => [array_search($niveau, self::NIVEAU_ORDER, true) === false ? PHP_INT_MAX : array_search($niveau, self::NIVEAU_ORDER, true), $niveau])
            ->values()
            ->all();
    }
}
