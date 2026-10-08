<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidat;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\GalleryAlbum;
use App\Models\Inscription;
use App\Models\NewsArticle;
use App\Models\Partenaire;
use App\Models\ReactivationRequest;
use App\Models\Teacher;
use App\Models\Testimonial;
use App\NewsStatus;
use App\PreinscriptionStatus;
use App\ReactivationStatus;
use App\StatutInscription;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const RECENT_ACTIVITY_LIMIT = 12;

    public function index(Request $request): Response
    {
        $dismissed = $this->dismissedActivityKeys($request);
        $activities = $this->activites();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'etudiants' => Etudiant::count(),
                'classes' => Classe::count(),
                'preinscriptions_en_attente' => Candidat::where('status', PreinscriptionStatus::Soumis)->count(),
                'inscriptions_validees' => Inscription::where('statut', StatutInscription::Validee)->count(),
            ],
            'contentStats' => [
                'filieres' => Filiere::count(),
                'enseignants' => Teacher::count(),
                'actualites_publiees' => NewsArticle::where('status', NewsStatus::Publie)->count(),
                'albums_galerie' => GalleryAlbum::count(),
                'temoignages' => Testimonial::count(),
                'partenaires' => Partenaire::count(),
            ],
            // Last-6-months sparkline per stat card, keyed the same as `stats`/
            // `contentStats` above — real creation-date counts, never invented.
            'trends' => [
                'etudiants' => $this->monthlyTrend(Etudiant::query(), 'created_at'),
                'classes' => $this->monthlyTrend(Classe::query(), 'created_at'),
                'preinscriptions_en_attente' => $this->monthlyTrend(Candidat::query(), 'created_at'),
                'inscriptions_validees' => $this->monthlyTrend(Inscription::where('statut', StatutInscription::Validee), 'created_at'),
                'filieres' => $this->monthlyTrend(Filiere::query(), 'created_at'),
                'enseignants' => $this->monthlyTrend(Teacher::query(), 'created_at'),
                'actualites_publiees' => $this->monthlyTrend(NewsArticle::where('status', NewsStatus::Publie), 'published_at'),
                'albums_galerie' => $this->monthlyTrend(GalleryAlbum::query(), 'created_at'),
                'temoignages' => $this->monthlyTrend(Testimonial::query(), 'created_at'),
                'partenaires' => $this->monthlyTrend(Partenaire::query(), 'created_at'),
            ],
            'preinscriptionsParMois' => $this->preinscriptionsParMois(),
            'etudiantsParNiveau' => $this->etudiantsParNiveau(),
            'etudiantsParFiliere' => $this->etudiantsParFiliere(),
            'activiteRecente' => $activities->reject(fn (array $item) => in_array($item['key'], $dismissed, true))->take(self::RECENT_ACTIVITY_LIMIT)->values()->all(),
            'activitesMasquees' => $activities->filter(fn (array $item) => in_array($item['key'], $dismissed, true))->count(),
            'dossiersParType' => $this->dossiersParType(),
            'aTraiter' => $this->aTraiter(),
        ]);
    }

    /**
     * The queues waiting on the scolarité / the editors, each with the page that
     * works through it. The page only shows the ones the account may open, so
     * the permission travels with the entry.
     *
     * @return array<int, array{key: string, count: int, href: string, permission: string}>
     */
    private function aTraiter(): array
    {
        return [
            [
                'key' => 'preinscriptions',
                'count' => Candidat::whereIn('status', [PreinscriptionStatus::Soumis, PreinscriptionStatus::EnExamen])->count(),
                'href' => '/console/preinscriptions',
                'permission' => 'preinscriptions.manage',
            ],
            [
                'key' => 'reinscriptions',
                'count' => Inscription::whereNotNull('type')->whereIn('statut', [StatutInscription::EnAttente, StatutInscription::EnExamen])->count(),
                'href' => '/console/scolarite/inscriptions',
                'permission' => 'inscriptions.view',
            ],
            [
                'key' => 'reactivations',
                'count' => ReactivationRequest::where('status', ReactivationStatus::EnAttente)->count(),
                'href' => '/console/reactivations',
                'permission' => 'reactivations.manage',
            ],
            [
                'key' => 'articles',
                'count' => NewsArticle::where('status', NewsStatus::EnAttente)->count(),
                'href' => '/console/actualites',
                'permission' => 'news.publish',
            ],
        ];
    }

    /**
     * Préinscription/Réinscription/Redoublant dossiers grouped into 3 buckets
     * — en cours (brouillon through à compléter), validé, refusé — for the
     * "Dossiers par type" chart.
     *
     * @return array<int, array{type: string, en_cours: int, valide: int, refuse: int}>
     */
    private function dossiersParType(): array
    {
        $enCoursPreinscription = ['brouillon', 'en_attente', 'en_cours_examen', 'a_completer'];
        $enCoursInscription = ['brouillon', 'en_attente', 'en_cours_examen', 'a_completer'];

        return [
            [
                'type' => 'Préinscription',
                'en_cours' => Candidat::whereIn('status', $enCoursPreinscription)->count(),
                'valide' => Candidat::where('status', PreinscriptionStatus::Accepte)->count(),
                'refuse' => Candidat::where('status', PreinscriptionStatus::Refuse)->count(),
            ],
            [
                'type' => 'Réinscription',
                'en_cours' => Inscription::where('type', 'reinscription')->whereIn('statut', $enCoursInscription)->count(),
                'valide' => Inscription::where('type', 'reinscription')->where('statut', StatutInscription::Validee)->count(),
                'refuse' => Inscription::where('type', 'reinscription')->where('statut', StatutInscription::Annulee)->count(),
            ],
            [
                'type' => 'Redoublant',
                'en_cours' => Inscription::where('type', 'redoublement')->whereIn('statut', $enCoursInscription)->count(),
                'valide' => Inscription::where('type', 'redoublement')->where('statut', StatutInscription::Validee)->count(),
                'refuse' => Inscription::where('type', 'redoublement')->where('statut', StatutInscription::Annulee)->count(),
            ],
        ];
    }

    private const MOIS_ABREGES = [
        1 => 'Janv', 2 => 'Févr', 3 => 'Mars', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin',
        7 => 'Juil', 8 => 'Août', 9 => 'Sept', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
    ];

    /**
     * Monthly préinscription volume for the last 6 months, oldest first.
     *
     * @return array<int, array{mois: string, total: int}>
     */
    private function preinscriptionsParMois(): array
    {
        $depuis = now()->subMonths(5)->startOfMonth();

        $preinscriptions = Candidat::where('created_at', '>=', $depuis)->get(['created_at']);

        return collect(range(5, 0))
            ->map(fn (int $i) => now()->subMonths($i)->startOfMonth())
            ->map(fn (Carbon $mois) => [
                'mois' => self::MOIS_ABREGES[(int) $mois->format('n')].' '.$mois->format('Y'),
                'total' => $preinscriptions->filter(fn (Candidat $p) => $p->created_at->isSameMonth($mois))->count(),
            ])
            ->all();
    }

    /**
     * Row counts per month for the last 6 months against $dateColumn, oldest
     * first — just the numbers, for a StatCard sparkline (see preinscriptionsParMois()
     * for the labeled version used by the larger area chart).
     *
     * @return array<int, int>
     */
    private function monthlyTrend(Builder $query, string $dateColumn): array
    {
        $depuis = now()->subMonths(5)->startOfMonth();

        $rows = (clone $query)->where($dateColumn, '>=', $depuis)->get([$dateColumn]);

        return collect(range(5, 0))
            ->map(fn (int $i) => now()->subMonths($i))
            ->map(fn (Carbon $mois) => $rows->filter(fn ($row) => $row->{$dateColumn}?->isSameMonth($mois))->count())
            ->all();
    }

    /**
     * @return array<int, array{niveau: string, total: int}>
     */
    private function etudiantsParNiveau(): array
    {
        return Etudiant::query()
            ->join('classes', 'classes.id', '=', 'etudiants.classe_id')
            ->selectRaw('classes.niveau as niveau, count(*) as total')
            ->groupBy('classes.niveau')
            ->orderBy('classes.niveau')
            ->get()
            ->map(fn ($row) => ['niveau' => $row->niveau, 'total' => (int) $row->total])
            ->all();
    }

    /**
     * @return array<int, array{filiere: string, total: int}>
     */
    private function etudiantsParFiliere(): array
    {
        return Etudiant::query()
            ->join('classes', 'classes.id', '=', 'etudiants.classe_id')
            ->join('filieres', 'filieres.id', '=', 'classes.filiere_id')
            ->selectRaw('filieres.nom_fr as filiere, count(*) as total')
            ->groupBy('filieres.nom_fr')
            ->orderBy('filieres.nom_fr')
            ->get()
            ->map(fn ($row) => ['filiere' => $row->filiere, 'total' => (int) $row->total])
            ->all();
    }

    /**
     * The last handful of préinscriptions, dossiers and inscriptions created,
     * merged into a single reverse-chronological feed. Each entry carries a `key`
     * ("{type}-{id}" of its dossier) so an account can hide it.
     *
     * @return Collection<int, array{key: string, type: string, label: string, subject: string, created_at: string}>
     */
    private function activites(): Collection
    {
        $preinscriptions = Candidat::latest()->take(10)->get()->map(fn (Candidat $p) => [
            'key' => "preinscription-{$p->id}",
            'type' => 'preinscription',
            'label' => 'Nouvelle préinscription',
            'subject' => trim("{$p->nom} {$p->prenoms}"),
            'created_at' => $p->created_at,
        ]);

        $etudiants = Etudiant::with('user:id,name')->latest()->take(10)->get()->map(fn (Etudiant $e) => [
            'key' => "etudiant-{$e->id}",
            'type' => 'etudiant',
            'label' => 'Dossier étudiant créé',
            'subject' => $e->user->name,
            'created_at' => $e->created_at,
        ]);

        $inscriptions = Inscription::with('etudiant.user:id,name')->latest()->take(10)->get()->map(fn (Inscription $i) => [
            'key' => "inscription-{$i->id}",
            'type' => 'inscription',
            'label' => "Inscription {$i->annee}",
            'subject' => $i->etudiant->user->name,
            'created_at' => $i->created_at,
        ]);

        return Collection::make([...$preinscriptions, ...$etudiants, ...$inscriptions])
            ->sortByDesc('created_at')
            ->map(fn (array $item) => [...$item, 'created_at' => $item['created_at']->toIso8601String()])
            ->values();
    }

    /**
     * Hides one entry of the recent-activity feed for the signed-in account.
     * The entry is only derived from a dossier, so nothing is deleted — the
     * dossier itself, and the feed of every other account, are untouched.
     */
    public function dismissActivity(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'regex:/^(preinscription|etudiant|inscription)-\d+$/'],
        ]);

        DB::table('dismissed_activities')->insertOrIgnore([
            'user_id' => $request->user()->getKey(),
            'activity_key' => $validated['key'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back();
    }

    /** Brings back every entry the signed-in account had hidden. */
    public function restoreActivities(Request $request): RedirectResponse
    {
        DB::table('dismissed_activities')->where('user_id', $request->user()->getKey())->delete();

        return back();
    }

    /**
     * @return array<int, string>
     */
    private function dismissedActivityKeys(Request $request): array
    {
        return DB::table('dismissed_activities')->where('user_id', $request->user()->getKey())->pluck('activity_key')->all();
    }
}
