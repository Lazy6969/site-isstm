<?php

namespace App\Http\Controllers\Materiel;

use App\Http\Controllers\Controller;
use App\MaterielStatut;
use App\Models\Materiel;
use App\Models\MaterielEmprunt;
use App\Models\MaterielIntervention;
use App\Models\MaterielMouvement;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $parStatut = Materiel::query()->selectRaw('statut, count(*) as total')->groupBy('statut')->pluck('total', 'statut');

        $retards = MaterielEmprunt::enRetard()->with('materiel:id,code,nom')->orderBy('date_retour_prevue')->limit(6)->get();
        $bientot = MaterielEmprunt::enCours()
            ->whereDate('date_retour_prevue', '>=', today())
            ->whereDate('date_retour_prevue', '<=', today()->addDays(3))
            ->with('materiel:id,code,nom')
            ->orderBy('date_retour_prevue')
            ->limit(5)
            ->get();

        return Inertia::render('Materiel/Dashboard', [
            'stats' => [
                'total' => Materiel::count(),
                'disponible' => (int) ($parStatut[MaterielStatut::Disponible->value] ?? 0),
                'emprunte' => (int) ($parStatut[MaterielStatut::Emprunte->value] ?? 0),
                'en_maintenance' => (int) ($parStatut[MaterielStatut::EnMaintenance->value] ?? 0),
                'en_panne' => (int) ($parStatut[MaterielStatut::EnPanne->value] ?? 0),
                'reforme' => (int) ($parStatut[MaterielStatut::Reforme->value] ?? 0),
                'retards' => MaterielEmprunt::enRetard()->count(),
                'valeur' => (int) Materiel::where('statut', '!=', MaterielStatut::Reforme->value)->sum('valeur'),
            ],
            'parStatut' => collect(MaterielStatut::cases())->map(fn (MaterielStatut $statut) => [
                'statut' => $statut->value,
                'label' => $statut->label(),
                'total' => (int) ($parStatut[$statut->value] ?? 0),
            ])->values(),
            'parCategorie' => Materiel::query()->selectRaw('categorie, count(*) as total')->groupBy('categorie')->orderByDesc('total')->get()
                ->map(fn ($row) => ['categorie' => $row->categorie, 'label' => Materiel::CATEGORIES[$row->categorie] ?? $row->categorie, 'total' => (int) $row->total])->values(),
            'empruntsParMois' => $this->loansPerMonth(6),
            'retards' => $retards->map(fn (MaterielEmprunt $emprunt) => $this->loanRow($emprunt))->values(),
            'aRendreBientot' => $bientot->map(fn (MaterielEmprunt $emprunt) => $this->loanRow($emprunt))->values(),
            'interventionsOuvertes' => MaterielIntervention::ouvertes()->with('materiel:id,code,nom')->latest('date_debut')->limit(6)->get()
                ->map(fn (MaterielIntervention $intervention) => [
                    'id' => $intervention->id,
                    'type' => $intervention->type,
                    'titre' => $intervention->titre,
                    'date_debut' => $intervention->date_debut->toDateString(),
                    'materiel' => ['id' => $intervention->materiel?->id, 'code' => $intervention->materiel?->code, 'nom' => $intervention->materiel?->nom],
                ])->values(),
            'recent' => MaterielMouvement::with(['materiel:id,code,nom', 'user:id,name'])->latest('created_at')->latest('id')->limit(8)->get()
                ->map(fn (MaterielMouvement $mouvement) => [
                    'id' => $mouvement->id,
                    'type' => $mouvement->type->value,
                    'label' => $mouvement->type->label(),
                    'de' => $mouvement->de,
                    'vers' => $mouvement->vers,
                    'user' => $mouvement->user?->name,
                    'materiel' => ['id' => $mouvement->materiel?->id, 'code' => $mouvement->materiel?->code, 'nom' => $mouvement->materiel?->nom],
                    'created_at' => $mouvement->created_at,
                ])->values(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function loanRow(MaterielEmprunt $emprunt): array
    {
        return [
            'id' => $emprunt->id,
            'emprunteur_nom' => $emprunt->emprunteur_nom,
            'date_retour_prevue' => $emprunt->date_retour_prevue->toDateString(),
            'jours_retard' => $emprunt->isEnRetard() ? (int) $emprunt->date_retour_prevue->diffInDays(today()) : 0,
            'materiel' => ['id' => $emprunt->materiel?->id, 'code' => $emprunt->materiel?->code, 'nom' => $emprunt->materiel?->nom],
        ];
    }

    /**
     * Loans started in each of the last $months months, oldest first, zero-filled.
     *
     * @return array<int, array{mois: string, label: string, total: int}>
     */
    private function loansPerMonth(int $months): array
    {
        $start = today()->startOfMonth()->subMonths($months - 1);

        $counts = MaterielEmprunt::where('date_sortie', '>=', $start)->get(['date_sortie'])
            ->countBy(fn (MaterielEmprunt $emprunt) => $emprunt->date_sortie->format('Y-m'));

        return collect(range(0, $months - 1))->map(function (int $offset) use ($start, $counts) {
            /** @var Carbon $month */
            $month = $start->copy()->addMonths($offset);

            return ['mois' => $month->format('Y-m'), 'label' => $month->translatedFormat('M'), 'total' => (int) ($counts[$month->format('Y-m')] ?? 0)];
        })->all();
    }
}
