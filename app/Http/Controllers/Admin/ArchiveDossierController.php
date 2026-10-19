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
    private const NIVEAU_ORDER = ['L1', 'L2', 'L3', 'M1', 'M2'];

    private const EXPORT_COLUMNS = ['Nom', 'Prénom(s)', 'Niveau', 'Filière', 'Année'];

    private const EXPORT_COLUMN_WEIGHTS = [2.5, 2, 1, 2.5, 1.5];

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);

        return Inertia::render('Admin/Resultats/Archives', [
            'dossiers' => $this->filteredDossiers($filters),
            'filters' => $filters,
            'filieres' => Filiere::orderBy('nom_fr')->get(['id', 'nom_fr']),
            'niveaux' => $this->niveaux(),
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
     * @return array{filiere_id: ?int, niveau: ?string, q: ?string}
     */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'filiere_id' => ['nullable', 'integer', 'exists:filieres,id'],
            'niveau' => ['nullable', 'string', 'max:10'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return [
            'filiere_id' => isset($validated['filiere_id']) ? (int) $validated['filiere_id'] : null,
            'niveau' => $validated['niveau'] ?? null,
            'q' => isset($validated['q']) && trim($validated['q']) !== '' ? trim($validated['q']) : null,
        ];
    }

    /**
     * A dossier matches the search when its own name matches, or when one of
     * its résultats' name does — so searching "Rakoto" finds the dossier
     * that candidate is filed under, not just a dossier literally named
     * that. The niveau/filière filters work the same way: they describe a
     * dossier's members, not the dossier itself, so a dossier matches when
     * at least one of its résultats does.
     *
     * @param  array{filiere_id: ?int, niveau: ?string, q: ?string}  $filters
     * @return Collection<int, ArchiveDossier>
     */
    private function filteredDossiers(array $filters): Collection
    {
        return ArchiveDossier::withCount('resultats')
            ->with(['resultats' => fn ($query) => $query->with('filiere:id,nom_fr')->orderBy('nom')])
            ->when($filters['q'], fn ($query, $term) => $query->where(fn ($outer) => $outer
                ->where('nom', 'like', "%{$term}%")
                ->orWhereHas('resultats', fn ($inner) => $inner
                    ->where('nom', 'like', "%{$term}%")
                    ->orWhere('prenoms', 'like', "%{$term}%"))))
            ->when($filters['niveau'], fn ($query, $niveau) => $query->whereHas('resultats', fn ($inner) => $inner->where('niveau', $niveau)))
            ->when($filters['filiere_id'], fn ($query, $id) => $query->whereHas('resultats', fn ($inner) => $inner->where('filiere_id', $id)))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();
    }

    /** @return array<int, string> */
    private function niveaux(): array
    {
        return ResultatAdmission::query()->whereNotNull('archive_dossier_id')->whereNotNull('niveau')->distinct()->pluck('niveau')
            ->sortBy(fn (string $niveau) => [array_search($niveau, self::NIVEAU_ORDER, true) === false ? PHP_INT_MAX : array_search($niveau, self::NIVEAU_ORDER, true), $niveau])
            ->values()
            ->all();
    }
}
