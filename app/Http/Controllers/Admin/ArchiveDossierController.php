<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ArchiveDossier;
use App\Models\Filiere;
use App\Models\ResultatAdmission;
use App\PdfWriter;
use App\XlsxWriter;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * The "Archives" page: named, dated dossiers (see ArchiveDossier's
 * docblock) created from the active Résultats list's "Archiver" action
 * (store()) — each independently viewable, renameable, restorable back to
 * the public list, deletable, and exportable (Excel/PDF) on its own.
 */
class ArchiveDossierController extends Controller
{
    private const EXPORT_COLUMNS = ['Nom', 'Prénom(s)', 'Niveau', 'Filière', 'Année'];

    private const EXPORT_COLUMN_WEIGHTS = [2.5, 2, 1, 2.5, 1.5];

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);

        return Inertia::render('Admin/Resultats/Archives', [
            'dossiers' => $this->filteredDossiers($filters),
            'filters' => $filters,
            'filieres' => Filiere::orderBy('nom_fr')->get(['id', 'nom_fr']),
            'annees' => $this->annees(),
        ]);
    }

    /**
     * Creates a dossier from the active list's currently displayed ids (see
     * the "Archiver" dialog on Resultats/Index.jsx) — the admin names it and
     * optionally dates it, then every selected résultat is filed under it
     * and immediately drops off the public page.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:150'],
            'date' => ['nullable', 'date'],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:resultat_admissions,id'],
        ]);

        $dossier = ArchiveDossier::create([
            'nom' => $validated['nom'],
            'date' => $validated['date'] ?? now()->toDateString(),
        ]);

        $count = ResultatAdmission::whereIn('id', $validated['ids'])->whereNull('archive_dossier_id')->update(['archive_dossier_id' => $dossier->id]);

        ActivityLog::record('resultats_archives', "{$count} résultat(s) archivé(s) sous « {$dossier->nom} ».", $dossier);

        return back()->with('status', "{$count} résultat(s) archivé(s) sous « {$dossier->nom} ».");
    }

    public function update(Request $request, ArchiveDossier $dossier): RedirectResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:150'],
            'date' => ['nullable', 'date'],
        ]);

        $dossier->update($validated);

        return back()->with('status', "Dossier « {$dossier->nom} » mis à jour.");
    }

    /**
     * Deletes the dossier and every résultat filed under it together — both
     * land in the corbeille as one unit (see TrashController's
     * archives-resultats entry, which restores/purges them together too).
     */
    public function destroy(ArchiveDossier $dossier): RedirectResponse
    {
        $nom = $dossier->nom;
        $dossier->resultats()->delete();
        $dossier->delete();

        return back()->with('status', "Dossier « {$nom} » et son contenu déplacés vers la corbeille.");
    }

    /**
     * "Restaurer" — un-archives every résultat the dossier holds back to
     * the public list, then removes the now-empty dossier: once nothing is
     * filed under it, it has nothing left to represent.
     */
    public function restore(ArchiveDossier $dossier): RedirectResponse
    {
        $nom = $dossier->nom;
        $count = $dossier->resultats()->count();
        $dossier->resultats()->update(['archive_dossier_id' => null]);
        $dossier->delete();

        return back()->with('status', "{$count} résultat(s) du dossier « {$nom} » restauré(s) dans la liste active.");
    }

    public function exportExcel(ArchiveDossier $dossier): BinaryFileResponse
    {
        return XlsxWriter::download(
            Str::slug($dossier->nom).'.xlsx',
            $dossier->nom,
            self::EXPORT_COLUMNS,
            $this->exportRows($dossier),
        );
    }

    public function exportPdf(ArchiveDossier $dossier): BinaryFileResponse
    {
        return PdfWriter::download(
            Str::slug($dossier->nom).'.pdf',
            $dossier->nom,
            self::EXPORT_COLUMNS,
            self::EXPORT_COLUMN_WEIGHTS,
            $this->exportRows($dossier),
        );
    }

    /** @return array<int, array<int, ?string>> */
    private function exportRows(ArchiveDossier $dossier): array
    {
        return $dossier->resultats()->with('filiere:id,nom_fr')->orderBy('nom')->get()
            ->map(fn (ResultatAdmission $resultat) => [
                $resultat->nom,
                $resultat->prenoms,
                $resultat->niveau,
                $resultat->filiere?->nom_fr,
                $resultat->date?->format('Y'),
            ])->all();
    }

    /**
     * @return array{annee: ?int, q: ?string}
     */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'annee' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return [
            'annee' => isset($validated['annee']) ? (int) $validated['annee'] : null,
            'q' => isset($validated['q']) && trim($validated['q']) !== '' ? trim($validated['q']) : null,
        ];
    }

    /**
     * The search and the year filter both look at the dossier itself (its name,
     * its date) — never at the résultats filed inside it.
     *
     * @param  array{annee: ?int, q: ?string}  $filters
     * @return Collection<int, ArchiveDossier>
     */
    private function filteredDossiers(array $filters): Collection
    {
        return ArchiveDossier::withCount('resultats')
            ->with(['resultats' => fn ($query) => $query->with('filiere:id,nom_fr')->orderBy('nom')])
            ->when($filters['q'], fn ($query, $term) => $query->where('nom', 'like', "%{$term}%"))
            ->when($filters['annee'], fn ($query, $annee) => $query->whereYear('date', $annee))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();
    }

    /** @return array<int, int> */
    private function annees(): array
    {
        return ArchiveDossier::query()->whereNotNull('date')->pluck('date')
            ->map(fn ($date) => (int) $date->format('Y'))
            ->unique()
            ->sortDesc()
            ->values()
            ->all();
    }
}
