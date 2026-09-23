<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Etudiant;
use App\Models\Evenement;
use App\Models\GalleryAlbum;
use App\Models\Inscription;
use App\Models\NewsArticle;
use App\Models\Preinscription;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class StatisticsController extends Controller
{
    private const CONTENT_STATUSES = ['brouillon', 'en_attente', 'publie', 'rejete', 'archive'];

    private const ROLE_LABELS = [
        'super-admin' => 'Super Admin',
        'scolarite' => 'Scolarité',
        'enseignant' => 'Enseignant',
        'responsable-materiel' => 'Matériel',
        'etudiant' => 'Étudiant',
    ];

    public function index(): Response
    {
        return Inertia::render('Admin/Statistiques/Index', [
            'usersByRole' => $this->usersByRole(),
            'contentByStatus' => $this->contentByStatus(),
            'etudiantsByStatut' => $this->countBy(Etudiant::query(), 'statut', fn ($s) => $s->label()),
            'inscriptionsByStatut' => $this->countBy(Inscription::query(), 'statut', fn ($s) => $s->label()),
            'preinscriptionsByStatut' => $this->countBy(Preinscription::query(), 'status', fn ($s) => $s->label()),
            'activiteParJour' => $this->activiteParJour(),
        ]);
    }

    /**
     * @return array<int, array{role: string, total: int}>
     */
    private function usersByRole(): array
    {
        return Role::query()
            ->withCount('users')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => ['role' => self::ROLE_LABELS[$role->name] ?? $role->name, 'total' => $role->users_count])
            ->all();
    }

    /**
     * One row per content module, one key per status — feeds a stacked bar chart.
     *
     * @return array<int, array<string, int|string>>
     */
    private function contentByStatus(): array
    {
        $modules = [
            'Actualités' => NewsArticle::query(),
            'Galerie' => GalleryAlbum::query(),
            'Événements' => Evenement::query(),
        ];

        return collect($modules)
            ->map(function (Builder $query, string $label) {
                // ->toBase() skips Eloquent's enum casting on `status`, so the
                // pluck keys are the raw DB strings this method matches against.
                $counts = $query->toBase()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

                $row = ['module' => $label];
                foreach (self::CONTENT_STATUSES as $status) {
                    $row[$status] = (int) ($counts[$status] ?? 0);
                }

                return $row;
            })
            ->values()
            ->all();
    }

    /**
     * Groups $query by its raw $column value and labels each group via a cast
     * enum instance — the label callback receives the model's own enum case,
     * so labels stay defined in one place (the enum) rather than duplicated here.
     *
     * @return array<int, array{statut: string, total: int}>
     */
    private function countBy(Builder $query, string $column, callable $label): array
    {
        return $query
            ->selectRaw("{$column}, count(*) as total")
            ->groupBy($column)
            ->get()
            ->map(fn ($row) => ['statut' => $label($row->{$column}), 'total' => (int) $row->total])
            ->all();
    }

    /**
     * Admin activity volume for the last 14 days, oldest first.
     *
     * @return array<int, array{jour: string, total: int}>
     */
    private function activiteParJour(): array
    {
        $depuis = now()->subDays(13)->startOfDay();

        $logs = ActivityLog::where('created_at', '>=', $depuis)->get(['created_at']);

        return collect(range(13, 0))
            ->map(fn (int $i) => now()->subDays($i)->startOfDay())
            ->map(fn (Carbon $jour) => [
                'jour' => $jour->format('d/m'),
                'total' => $logs->filter(fn (ActivityLog $log) => $log->created_at->isSameDay($jour))->count(),
            ])
            ->all();
    }
}
