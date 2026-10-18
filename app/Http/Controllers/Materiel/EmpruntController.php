<?php

namespace App\Http\Controllers\Materiel;

use App\Exceptions\MaterielException;
use App\Http\Controllers\Controller;
use App\Models\MaterielEmprunt;
use App\Services\MaterielService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmpruntController extends Controller
{
    public function index(): Response
    {
        $emprunts = MaterielEmprunt::with('materiel:id,code,nom,categorie')
            ->latest('date_sortie')
            ->latest('id')
            ->limit(1000)
            ->get();

        return Inertia::render('Materiel/Emprunts/Index', [
            'emprunts' => $emprunts->map(fn (MaterielEmprunt $emprunt) => [
                ...MaterielController::presentEmprunt($emprunt),
                'materiel' => [
                    'id' => $emprunt->materiel?->id,
                    'code' => $emprunt->materiel?->code,
                    'nom' => $emprunt->materiel?->nom,
                    'categorie' => $emprunt->materiel?->categorie,
                ],
            ])->values(),
            'options' => MaterielController::options(),
        ]);
    }

    public function retour(Request $request, MaterielEmprunt $emprunt, MaterielService $service): RedirectResponse
    {
        $data = $request->validate([
            'etat_au_retour' => ['required', Rule::in(array_keys(MaterielEmprunt::ETATS_RETOUR))],
            'note_retour' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $service->giveBack($emprunt, $data['etat_au_retour'], $data['note_retour'] ?? null, $request->user());
        } catch (MaterielException $exception) {
            return back()->withErrors(['action' => $exception->getMessage()]);
        }

        return back()->with('status', $data['etat_au_retour'] === 'endommage'
            ? 'Retour enregistré : le matériel est signalé en panne.'
            : 'Retour enregistré : le matériel est de nouveau disponible.');
    }

    public function prolonger(Request $request, MaterielEmprunt $emprunt): RedirectResponse
    {
        abort_if($emprunt->date_retour_effective !== null, 409, 'Ce prêt est déjà clôturé.');

        $data = $request->validate([
            'date_retour_prevue' => ['required', 'date', 'after:'.$emprunt->date_retour_prevue->toDateString()],
        ], [
            'date_retour_prevue.after' => 'La nouvelle date doit être postérieure à la date de retour actuelle.',
        ]);

        $emprunt->update($data);

        return back()->with('status', 'Prêt prolongé.');
    }
}
