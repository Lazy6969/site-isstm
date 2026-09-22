<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\GalleryAlbum;
use App\Models\Inscription;
use App\Models\NewsArticle;
use App\Models\Partenaire;
use App\Models\Preinscription;
use App\Models\Teacher;
use App\Models\Testimonial;
use App\NewsStatus;
use App\PreinscriptionStatus;
use App\StatutInscription;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'etudiants' => Etudiant::count(),
                'classes' => Classe::count(),
                'preinscriptions_en_attente' => Preinscription::where('status', PreinscriptionStatus::EnAttente)->count(),
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
            'preinscriptionsParMois' => $this->preinscriptionsParMois(),
            'etudiantsParNiveau' => $this->etudiantsParNiveau(),
            'etudiantsParFiliere' => $this->etudiantsParFiliere(),
            'activiteRecente' => $this->activiteRecente(),
        ]);
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

        $preinscriptions = Preinscription::where('created_at', '>=', $depuis)->get(['created_at']);

        return collect(range(5, 0))
            ->map(fn (int $i) => now()->subMonths($i)->startOfMonth())
            ->map(fn (Carbon $mois) => [
                'mois' => self::MOIS_ABREGES[(int) $mois->format('n')].' '.$mois->format('Y'),
                'total' => $preinscriptions->filter(fn (Preinscription $p) => $p->created_at->isSameMonth($mois))->count(),
            ])
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
     * merged into a single reverse-chronological feed.
     *
     * @return array<int, array{type: string, label: string, subject: string, created_at: string}>
     */
    private function activiteRecente(): array
    {
        $preinscriptions = Preinscription::latest()->take(5)->get()->map(fn (Preinscription $p) => [
            'type' => 'preinscription',
            'label' => 'Nouvelle préinscription',
            'subject' => trim("{$p->nom} {$p->prenoms}"),
            'created_at' => $p->created_at,
        ]);

        $etudiants = Etudiant::with('user:id,name')->latest()->take(5)->get()->map(fn (Etudiant $e) => [
            'type' => 'etudiant',
            'label' => 'Dossier étudiant créé',
            'subject' => $e->user->name,
            'created_at' => $e->created_at,
        ]);

        $inscriptions = Inscription::with('etudiant.user:id,name')->latest()->take(5)->get()->map(fn (Inscription $i) => [
            'type' => 'inscription',
            'label' => "Inscription {$i->annee}",
            'subject' => $i->etudiant->user->name,
            'created_at' => $i->created_at,
        ]);

        return Collection::make([...$preinscriptions, ...$etudiants, ...$inscriptions])
            ->sortByDesc('created_at')
            ->take(6)
            ->map(fn (array $item) => [...$item, 'created_at' => $item['created_at']->toIso8601String()])
            ->values()
            ->all();
    }
}
