<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResultatAdmissionRequest;
use App\Models\ActivityLog;
use App\Models\Filiere;
use App\Models\ResultatAdmission;
use App\XlsxReader;
use App\XlsxWriter;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * The "Résultats" page under Établissement: a standalone, admin-published
 * list of admitted candidates — see ResultatAdmission's docblock for why
 * it's never linked to the préinscription workflow.
 *
 * "Archiver" here only collects the ids the admin currently has on screen
 * and hands them to Admin\ArchiveDossierController::store(), which does the
 * actual archiving as a named, dated dossier — see that controller and
 * ArchiveDossier's docblock for the rest of the archive lifecycle (view,
 * rename, restore, delete, export).
 */
class ResultatAdmissionController extends Controller
{
    private const NIVEAU_ORDER = ['L1', 'L2', 'L3', 'M1', 'M2'];

    private const IMPORT_COLUMNS = ['Nom', 'Prénom(s)', 'Niveau', 'Filière', 'Année (AAAA)'];

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);

        return Inertia::render('Admin/Resultats/Index', [
            'resultats' => $this->activeResultats($filters),
            'filters' => $filters,
            'filieres' => Filiere::orderBy('nom_fr')->get(['id', 'nom_fr']),
            'niveaux' => $this->niveaux(),
        ]);
    }

    public function store(StoreResultatAdmissionRequest $request): RedirectResponse
    {
        $resultat = ResultatAdmission::create($request->validated());

        ActivityLog::record('resultat_cree', "Résultat ajouté : {$resultat->nom} {$resultat->prenoms}", $resultat);

        return back()->with('status', 'Résultat ajouté.');
    }

    public function update(Request $request, ResultatAdmission $resultat): RedirectResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'prenoms' => ['nullable', 'string', 'max:100'],
            'niveau' => ['nullable', 'string', 'max:10'],
            'filiere_id' => ['nullable', 'exists:filieres,id'],
            'date' => ['nullable', 'date'],
        ]);

        $resultat->update($validated);

        return back()->with('status', "Résultat de {$resultat->nom} {$resultat->prenoms} mis à jour.");
    }

    public function destroy(ResultatAdmission $resultat): RedirectResponse
    {
        $resultat->delete();

        return back()->with('status', 'Résultat déplacé vers la corbeille.');
    }

    /**
     * Soft-deletes every résultat — active and archived alike — not just the
     * ones the current filters show. A bulk `Builder::delete()` call on a
     * SoftDeletes model performs one UPDATE setting deleted_at, not a real
     * DELETE, so this lands in the corbeille exactly like a one-by-one
     * delete and stays recoverable. Archived résultats keep their
     * archive_dossier_id, so restoring one from the corbeille individually
     * still shows it back under its dossier.
     */
    public function destroyAll(): RedirectResponse
    {
        $count = ResultatAdmission::count();

        if ($count === 0) {
            return back()->with('status', 'Aucun résultat à supprimer.');
        }

        ResultatAdmission::query()->delete();

        ActivityLog::record('resultats_tous_supprimes', "{$count} résultat(s) supprimé(s) (suppression groupée).");

        return back()->with('status', "{$count} résultat(s) déplacé(s) vers la corbeille.");
    }

    /**
     * A blank workbook with the exact header columns `import()` expects —
     * the admin fills it in Excel/LibreOffice and re-uploads it.
     */
    public function template(): BinaryFileResponse
    {
        return XlsxWriter::download('modele-resultats.xlsx', 'Résultats', self::IMPORT_COLUMNS, []);
    }

    /**
     * Bulk-creates one résultat per data row of an uploaded .xlsx/.csv file,
     * following the Nom / Prénom(s) / Niveau / Filière / Année column order
     * template() hands out. A row with no Nom is skipped rather than
     * rejecting the whole file — a trailing blank row in the spreadsheet is
     * common and shouldn't block the rest of the import. Filière is matched
     * by name or code (case-insensitive); anything that doesn't match an
     * existing filière is imported with no filière rather than failing, so a
     * typo in one row never blocks the others. Same leniency for Année: an
     * unparseable value is imported with no year rather than failing.
     */
    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,csv,txt', 'max:5120'],
        ]);

        $file = $validated['file'];
        $extension = strtolower($file->getClientOriginalExtension());

        try {
            $rows = $extension === 'csv' || $extension === 'txt'
                ? $this->readCsv($file->getRealPath())
                : XlsxReader::read($file->getRealPath());
        } catch (RuntimeException $e) {
            return back()->withErrors(['file' => $e->getMessage()]);
        }

        // The first row is the header (Nom / Prénom(s) / Niveau / Filière / Année).
        array_shift($rows);

        $filiereLookup = $this->filiereLookup();
        $imported = 0;

        foreach ($rows as $row) {
            $nom = trim($row[0] ?? '');
            if ($nom === '') {
                continue;
            }

            $filiereKey = mb_strtolower(trim($row[3] ?? ''));

            ResultatAdmission::create([
                'nom' => $nom,
                'prenoms' => trim($row[1] ?? '') ?: null,
                'niveau' => trim($row[2] ?? '') ?: null,
                'filiere_id' => $filiereLookup[$filiereKey] ?? null,
                'date' => $this->parseDate(trim($row[4] ?? '')),
            ]);
            $imported++;
        }

        if ($imported === 0) {
            return back()->withErrors(['file' => 'Aucune ligne valide trouvée dans ce fichier (la colonne Nom doit être remplie).']);
        }

        ActivityLog::record('resultats_importes', "{$imported} résultat(s) importé(s).");

        return back()->with('status', "{$imported} résultat(s) importé(s).");
    }

    /**
     * The template's own column only ever asks for a 4-digit year (stored as
     * 1 January of that year — only the year is ever shown or edited
     * elsewhere in Résultats). A plain "2026" is read as that year directly;
     * a longer digit string is instead a real Excel date cell's serial
     * number (the count of days since 1899-12-30 — XlsxReader has no access
     * to the cell's display format), which this still accepts for an admin
     * re-importing an older file. Full DD/MM/YYYY-style dates are accepted
     * too, for the same reason, reduced down to their year. Anything else
     * comes back null rather than failing the row.
     */
    private function parseDate(string $raw): ?string
    {
        if ($raw === '') {
            return null;
        }

        if (preg_match('/^\d{4}$/', $raw) && $raw >= 1900 && $raw <= 2100) {
            return Carbon::create((int) $raw, 1, 1)->toDateString();
        }

        if (preg_match('/^\d+(\.\d+)?$/', $raw)) {
            return Carbon::create(1899, 12, 30)->addDays((int) $raw)->startOfYear()->toDateString();
        }

        foreach (['d/m/Y', 'Y-m-d', 'd-m-Y'] as $format) {
            try {
                return Carbon::createFromFormat($format, $raw)->startOfYear()->toDateString();
            } catch (\Exception) {
                continue;
            }
        }

        return null;
    }

    /** @return array<string, int> lower-cased nom_fr/code → filiere id */
    private function filiereLookup(): array
    {
        $lookup = [];

        foreach (Filiere::query()->get(['id', 'nom_fr', 'code']) as $filiere) {
            $lookup[mb_strtolower($filiere->nom_fr)] = $filiere->id;

            if ($filiere->code) {
                $lookup[mb_strtolower($filiere->code)] = $filiere->id;
            }
        }

        return $lookup;
    }

    /** @return array<int, array<int, string>> */
    private function readCsv(string $path): array
    {
        // French-locale exports from Excel use ";" (Excel's default list
        // separator when the OS decimal separator is a comma); a sample of
        // the file decides which one this particular export actually used.
        $sample = file_get_contents($path, false, null, 0, 2000) ?: '';
        $delimiter = substr_count($sample, ';') > substr_count($sample, ',') ? ';' : ',';

        $handle = fopen($path, 'r');
        if ($handle === false) {
            throw new RuntimeException('Impossible de lire le fichier CSV.');
        }

        $rows = [];
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rows[] = $row;
        }
        fclose($handle);

        return $rows;
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
     * @param  array{filiere_id: ?int, niveau: ?string, q: ?string}  $filters
     * @return Collection<int, ResultatAdmission>
     */
    private function activeResultats(array $filters): Collection
    {
        return ResultatAdmission::with('filiere:id,nom_fr')
            ->whereNull('archive_dossier_id')
            ->when($filters['filiere_id'], fn ($query, $id) => $query->where('filiere_id', $id))
            ->when($filters['niveau'], fn ($query, $niveau) => $query->where('niveau', $niveau))
            ->when($filters['q'], fn ($query, $q) => $query->where(fn ($inner) => $inner
                ->where('nom', 'like', "%{$q}%")
                ->orWhere('prenoms', 'like', "%{$q}%")))
            ->orderBy('nom')
            ->get();
    }

    /** @return array<int, string> */
    private function niveaux(): array
    {
        return ResultatAdmission::query()->whereNull('archive_dossier_id')->whereNotNull('niveau')->distinct()->pluck('niveau')
            ->sortBy(fn (string $niveau) => [array_search($niveau, self::NIVEAU_ORDER, true) === false ? PHP_INT_MAX : array_search($niveau, self::NIVEAU_ORDER, true), $niveau])
            ->values()
            ->all();
    }
}
