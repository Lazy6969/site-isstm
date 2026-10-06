<?php

namespace App\Http\Controllers\Admin;

use App\ActionArchiveRecorder;
use App\ArchiveVault;
use App\Http\Controllers\Controller;
use App\Models\ActionArchive;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The locked action archive. Entries are never edited or deleted: a
 * restoration or a note is itself appended as a new entry pointing to the
 * original one. Everything here sits behind the archive key (ArchiveVault).
 */
class ActionArchiveController extends Controller
{
    public function __construct(private ArchiveVault $vault, private ActionArchiveRecorder $recorder) {}

    public function index(Request $request): Response
    {
        if (! $this->vault->isUnlocked($request)) {
            return Inertia::render('Admin/Archives/Locked', [
                'lockedOutFor' => $this->vault->lockedOutFor($request),
            ]);
        }

        $archives = $this->filtered($request)
            ->latest('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ActionArchive $archive) => [
                'id' => $archive->id,
                'user_name' => $archive->user_name,
                'user_role' => $archive->user_role,
                'method' => $archive->method,
                'route_name' => $archive->route_name,
                'path' => $archive->path,
                'module' => $archive->module,
                'action' => $archive->action,
                'subject_label' => $archive->subject_label,
                'target_id' => $archive->target_id,
                'outcome' => $archive->outcome,
                'status_code' => $archive->status_code,
                'changes' => $archive->changesList(),
                'input' => $archive->inputData(),
                'ip_address' => $archive->ip_address,
                'hash' => $archive->hash,
                'previous_hash' => $archive->previous_hash,
                'created_at' => $archive->created_at->toIso8601String(),
            ]);

        $ids = $archives->getCollection()->pluck('id');

        return Inertia::render('Admin/Archives/Index', [
            'archives' => $archives,
            'filters' => $request->only(['q', 'user', 'module', 'action', 'outcome', 'from', 'to']),
            'options' => [
                'users' => ActionArchive::query()->whereNotNull('user_name')->distinct()->orderBy('user_name')->pluck('user_name'),
                'modules' => ActionArchive::query()->whereNotNull('module')->distinct()->orderBy('module')->pluck('module'),
                'actions' => ActionArchive::query()->whereNotNull('action')->distinct()->orderBy('action')->pluck('action'),
            ],
            'stats' => [
                'total' => ActionArchive::count(),
                'today' => ActionArchive::where('created_at', '>=', now()->startOfDay())->count(),
                'contributors' => ActionArchive::whereNotNull('user_name')->distinct()->count('user_name'),
                'failed' => ActionArchive::where('outcome', 'failed')->count(),
            ],
            'security' => [
                'protected' => $this->vault->isProtected(),
                'hasKey' => $this->vault->hasKey(),
            ],
            'restored' => $this->restoredMap($ids),
            'notes' => $this->notesMap($ids),
        ]);
    }

    public function unlock(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'string']]);

        if ($error = $this->keyError($request, 'password')) {
            return back()->withErrors($error);
        }

        $this->vault->unlock($request);

        return redirect()->route('admin.archives.index');
    }

    public function lock(Request $request): RedirectResponse
    {
        $this->vault->lock($request);

        return redirect()->route('admin.archives.index');
    }

    /**
     * Re-computes the hash chain and reports the first broken entry, if any.
     */
    public function verify(): JsonResponse
    {
        return response()->json(ActionArchive::verifyChain());
    }

    /**
     * Adds a note to an entry. Entries themselves stay untouched; the note is
     * archived as its own entry (created by ArchiveAdminActions).
     */
    public function note(Request $request, ActionArchive $archive): RedirectResponse
    {
        $request->validate(['note' => ['required', 'string', 'max:1000']]);

        $request->attributes->set('archive_target_id', $archive->id);

        return back()->with('status', 'Note ajoutée à l\'archive.');
    }

    /**
     * Puts one archived change back: an update is reverted to its previous
     * values, a deletion is re-created. Requires the key again.
     */
    public function restore(Request $request, ActionArchive $archive): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string'],
            'change' => ['required', 'integer', 'min:0'],
        ]);

        $request->attributes->set('archive_target_id', $archive->id);

        if ($error = $this->keyError($request, 'password')) {
            return back()->withErrors($error);
        }

        $index = (int) $validated['change'];
        $change = $archive->changesList()[$index] ?? null;

        if (($change['restorable'] ?? false) !== true) {
            return back()->withErrors(['restore' => 'Cette modification ne peut pas être restaurée.']);
        }

        if (isset($this->restoredMap(collect([$archive->id]))[$archive->id]) && in_array($index, $this->restoredMap(collect([$archive->id]))[$archive->id], true)) {
            return back()->withErrors(['restore' => 'Cette modification a déjà été restaurée.']);
        }

        $class = $change['class'] ?? '';

        if (! is_string($class) || ! str_starts_with($class, 'App\\Models\\') || ! is_subclass_of($class, Model::class)) {
            return back()->withErrors(['restore' => 'Élément non restaurable.']);
        }

        $problem = DB::transaction(fn () => $change['event'] === 'deleted'
            ? $this->restoreDeleted(new $class, $change)
            : $this->restoreUpdated(new $class, $change));

        if ($problem !== null) {
            return back()->withErrors(['restore' => $problem]);
        }

        return back()->with('status', 'Modification restaurée.');
    }

    public function changePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed'],
        ]);

        if ($error = $this->keyError($request, 'current_password', $validated['current_password'])) {
            return back()->withErrors($error);
        }

        $this->vault->setKey($validated['password']);
        $this->vault->lock($request);

        return redirect()->route('admin.archives.index')->with('status', 'Clé de l\'archive modifiée.');
    }

    /**
     * Turns the key requirement off ("public" archive) or back on.
     */
    public function visibility(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string'],
            'protected' => ['required', 'boolean'],
        ]);

        if ($error = $this->keyError($request, 'password')) {
            return back()->withErrors($error);
        }

        $this->vault->setProtected((bool) $validated['protected']);

        return back()->with('status', $validated['protected'] ? 'Archive protégée par la clé.' : 'Archive rendue publique.');
    }

    public function export(Request $request): StreamedResponse
    {
        $query = $this->filtered($request)->latest('id')->limit(10000);

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['ID', 'Date', 'Utilisateur', 'Rôle', 'Module', 'Action', 'Élément', 'Résultat', 'Méthode', 'Chemin', 'IP', 'Modifications']);

            foreach ($query->cursor() as $archive) {
                fputcsv($handle, [
                    $archive->id,
                    $archive->created_at->format('Y-m-d H:i:s'),
                    $archive->user_name,
                    $archive->user_role,
                    $archive->module,
                    $archive->action,
                    $archive->subject_label,
                    $archive->outcome,
                    $archive->method,
                    $archive->path,
                    $archive->ip_address,
                    $archive->getRawOriginal('changes'),
                ]);
            }

            fclose($handle);
        }, 'archives-des-actions.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Checks the key sent in `$field`, with throttling. Returns the error
     * bag to flash, or null when the key is right.
     *
     * @return array<string, string>|null
     */
    private function keyError(Request $request, string $field, ?string $value = null): ?array
    {
        if (! $this->vault->hasKey()) {
            return [$field => 'Aucune clé n\'est définie pour l\'archive.'];
        }

        if (($seconds = $this->vault->lockedOutFor($request)) !== null) {
            return [$field => "Trop de tentatives. Réessayez dans {$seconds} secondes."];
        }

        if (! $this->vault->checkKey($value ?? (string) $request->input($field))) {
            $this->vault->recordFailure($request);

            return [$field => 'Clé incorrecte.'];
        }

        $this->vault->clearFailures($request);

        return null;
    }

    /**
     * @param  array<string, mixed>  $change
     */
    private function restoreUpdated(Model $model, array $change): ?string
    {
        $table = $model->getTable();
        $current = DB::table($table)->where($model->getKeyName(), $change['id'])->first();

        if ($current === null) {
            return 'L\'élément n\'existe plus : impossible de restaurer sa modification.';
        }

        $current = (array) $current;
        $values = [];
        $fields = [];

        foreach ($change['fields'] as $column => [$before, $after]) {
            if (! array_key_exists($column, $current)) {
                continue;
            }

            $values[$column] = $before;
            $fields[$column] = [$current[$column], $before];
        }

        if ($model->usesTimestamps() && Schema::hasColumn($table, $model->getUpdatedAtColumn())) {
            $values[$model->getUpdatedAtColumn()] = now();
        }

        DB::table($table)->where($model->getKeyName(), $change['id'])->update($values);
        $this->recorder->note('updated', $model::class, $change['id'], $change['label'], $fields);

        return null;
    }

    /**
     * @param  array<string, mixed>  $change
     */
    private function restoreDeleted(Model $model, array $change): ?string
    {
        $table = $model->getTable();
        $existing = DB::table($table)->where($model->getKeyName(), $change['id'])->first();

        if ($existing !== null) {
            $deletedAtColumn = method_exists($model, 'getDeletedAtColumn') ? $model->getDeletedAtColumn() : null;

            if ($deletedAtColumn === null || ((array) $existing)[$deletedAtColumn] === null) {
                return 'Cet élément existe déjà.';
            }

            DB::table($table)->where($model->getKeyName(), $change['id'])->update([$deletedAtColumn => null]);
            $this->recorder->note('created', $model::class, $change['id'], $change['label'], []);

            return null;
        }

        DB::table($table)->insert($change['attributes'] ?? []);
        $this->recorder->note('created', $model::class, $change['id'], $change['label'], []);

        return null;
    }

    /**
     * archive id → indexes of its changes that were restored.
     *
     * @param  Collection<int, int>  $ids
     * @return array<int, array<int, int>>
     */
    private function restoredMap($ids): array
    {
        $map = [];

        ActionArchive::query()
            ->where('action', 'restore')
            ->where('outcome', 'success')
            ->whereIn('target_id', $ids)
            ->get(['target_id', 'input'])
            ->each(function (ActionArchive $entry) use (&$map): void {
                $index = $entry->inputData()['change'] ?? null;

                if ($index !== null) {
                    $map[$entry->target_id][] = (int) $index;
                }
            });

        return $map;
    }

    /**
     * archive id → notes added to it.
     *
     * @param  Collection<int, int>  $ids
     * @return array<int, array<int, array<string, mixed>>>
     */
    private function notesMap($ids): array
    {
        return ActionArchive::query()
            ->where('action', 'note')
            ->where('outcome', 'success')
            ->whereIn('target_id', $ids)
            ->orderBy('id')
            ->get(['id', 'target_id', 'user_name', 'input', 'created_at'])
            ->groupBy('target_id')
            ->map(fn ($entries) => $entries->map(fn (ActionArchive $entry) => [
                'id' => $entry->id,
                'user_name' => $entry->user_name,
                'text' => $entry->inputData()['note'] ?? '',
                'created_at' => $entry->created_at->toIso8601String(),
            ])->values())
            ->all();
    }

    /**
     * @return Builder<ActionArchive>
     */
    private function filtered(Request $request): Builder
    {
        return ActionArchive::query()
            ->when($request->filled('user'), fn (Builder $query) => $query->where('user_name', $request->string('user')->toString()))
            ->when($request->filled('module'), fn (Builder $query) => $query->where('module', $request->string('module')->toString()))
            ->when($request->filled('action'), fn (Builder $query) => $query->where('action', $request->string('action')->toString()))
            ->when($request->filled('outcome'), fn (Builder $query) => $query->where('outcome', $request->string('outcome')->toString()))
            ->when($request->date('from'), fn (Builder $query, $from) => $query->where('created_at', '>=', $from->startOfDay()))
            ->when($request->date('to'), fn (Builder $query, $to) => $query->where('created_at', '<=', $to->endOfDay()))
            ->when($request->filled('q'), function (Builder $query) use ($request): void {
                $term = '%'.addcslashes($request->string('q')->toString(), '%_\\').'%';
                $query->where(fn (Builder $inner) => $inner
                    ->where('user_name', 'like', $term)
                    ->orWhere('subject_label', 'like', $term)
                    ->orWhere('path', 'like', $term)
                    ->orWhere('changes', 'like', $term)
                    ->orWhere('ip_address', 'like', $term));
            });
    }
}
