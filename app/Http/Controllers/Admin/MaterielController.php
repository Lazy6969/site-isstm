<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaterielDeplacementRequest;
use App\Http\Requests\StoreMaterielMaintenanceRequest;
use App\Http\Requests\StoreMaterielRequest;
use App\Http\Requests\UpdateMaterielRequest;
use App\MaterielDeplacementStatut;
use App\MaterielEtat;
use App\Models\Materiel;
use App\Models\MaterielDeplacement;
use App\Services\MaterielPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaterielController extends Controller
{
    /**
     * The matériel role's own dedicated space (MaterielLayout, no sidebar).
     */
    public function index(Request $request): Response
    {
        return $this->renderIndex($request, embedded: false);
    }

    /**
     * Same page, reached from inside the admin console — rendered embedded
     * in AdminLayout (sidebar and all) like every other console module.
     */
    public function indexAdmin(Request $request): Response
    {
        return $this->renderIndex($request, embedded: true);
    }

    private function renderIndex(Request $request, bool $embedded): Response
    {
        $materiels = Materiel::query()
            ->with(['maintenances.creePar:id,name', 'deplacements.creePar:id,name'])
            ->orderBy('lieu')
            ->orderBy('nom')
            ->get();

        $presenter = app(MaterielPresenter::class);
        $user = $request->user();

        return Inertia::render('Materiel/Index', [
            'materiels' => $materiels->map(fn (Materiel $materiel) => $presenter->present($materiel)),
            'etats' => collect(MaterielEtat::cases())->map(fn (MaterielEtat $e) => ['value' => $e->value, 'label' => $e->label()]),
            'stats' => [
                'total_references' => $materiels->count(),
                'total_quantite' => $materiels->sum('quantite'),
                'total_lieux' => $materiels->pluck('lieu')->unique()->count(),
                'total_en_panne' => $materiels->where('etat', MaterielEtat::EnPanne)->count(),
            ],
            'can' => [
                'create' => $user->can('materiel.create'),
                'edit' => $user->can('materiel.edit'),
                'delete' => $user->can('materiel.delete'),
            ],
            'embedded' => $embedded,
        ]);
    }

    public function store(StoreMaterielRequest $request): RedirectResponse
    {
        Materiel::create([
            ...$request->validated(),
            'ajoute_par' => $request->user()->id,
        ]);

        return back()->with('status', __('Matériel ajouté.'));
    }

    public function update(UpdateMaterielRequest $request, Materiel $materiel): RedirectResponse
    {
        $materiel->update($request->validated());

        return back()->with('status', __('Matériel mis à jour.'));
    }

    public function destroy(Materiel $materiel): RedirectResponse
    {
        $materiel->delete();

        return back()->with('status', __('Matériel supprimé.'));
    }

    public function storeMaintenance(StoreMaterielMaintenanceRequest $request, Materiel $materiel): RedirectResponse
    {
        $validated = $request->validated();

        $materiel->maintenances()->create([
            ...$validated,
            'cree_par' => $request->user()->id,
        ]);

        if (($validated['etat_apres'] ?? null) !== null) {
            $materiel->update(['etat' => $validated['etat_apres']]);
        }

        return back()->with('status', __('Intervention enregistrée.'));
    }

    public function emprunter(StoreMaterielDeplacementRequest $request, Materiel $materiel): RedirectResponse
    {
        $validated = $request->validated();

        abort_if($validated['lieu_destination'] === $materiel->lieu, 422, 'Le lieu de destination doit être différent du lieu actuel.');

        $quantiteEmprunt = min($validated['quantite_emprunt'], $materiel->quantite);
        abort_if($quantiteEmprunt < 1, 422, 'Aucune quantité disponible pour cet emprunt.');

        $materiel->deplacements()->create([
            'lieu_origine' => $materiel->lieu,
            'lieu_destination' => $validated['lieu_destination'],
            'motif' => $validated['motif'] ?? null,
            'emprunteur' => $validated['emprunteur'],
            'quantite' => $quantiteEmprunt,
            'cree_par' => $request->user()->id,
        ]);

        $materiel->decrement('quantite', $quantiteEmprunt);

        return back()->with('status', __('Matériel emprunté.'));
    }

    public function retourner(MaterielDeplacement $deplacement): RedirectResponse
    {
        abort_if($deplacement->statut !== MaterielDeplacementStatut::EnCours, 409, 'Cet emprunt a déjà été retourné.');

        $deplacement->update(['statut' => MaterielDeplacementStatut::Retourne, 'date_retour' => now()]);
        $deplacement->materiel->increment('quantite', $deplacement->quantite);

        return back()->with('status', __('Matériel retourné.'));
    }

    public function destroyDeplacement(MaterielDeplacement $deplacement): RedirectResponse
    {
        if ($deplacement->statut === MaterielDeplacementStatut::EnCours) {
            $deplacement->materiel->increment('quantite', $deplacement->quantite);
        }

        $deplacement->delete();

        return back()->with('status', __("Entrée de l'historique supprimée."));
    }

    public function destroyAllHistorique(): RedirectResponse
    {
        MaterielDeplacement::query()
            ->where('statut', MaterielDeplacementStatut::EnCours)
            ->each(fn (MaterielDeplacement $deplacement) => $deplacement->materiel->increment('quantite', $deplacement->quantite));

        MaterielDeplacement::query()->delete();

        return back()->with('status', __('Historique vidé.'));
    }
}
