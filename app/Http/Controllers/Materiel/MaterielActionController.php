<?php

namespace App\Http\Controllers\Materiel;

use App\Exceptions\MaterielException;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Materiel;
use App\Models\MaterielEmprunt;
use App\Models\MaterielIntervention;
use App\Services\MaterielService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The day-to-day actions on one piece of equipment: move it, lend it, report a
 * breakdown, put it in maintenance, retire it. The rules live in
 * MaterielService; a refused action comes back as an error on the form.
 */
class MaterielActionController extends Controller
{
    public function __construct(private readonly MaterielService $service) {}

    public function deplacer(Request $request, Materiel $materiel): RedirectResponse
    {
        $data = $request->validate([
            'vers' => ['required', 'string', 'max:150'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        return $this->run(fn () => $this->service->move($materiel, $data['vers'], $data['note'] ?? null, $request->user()), 'Déplacement enregistré.');
    }

    public function preter(Request $request, Materiel $materiel): RedirectResponse
    {
        $data = $request->validate([
            'emprunteur_nom' => ['required', 'string', 'max:150'],
            'emprunteur_type' => ['required', Rule::in(array_keys(MaterielEmprunt::EMPRUNTEUR_TYPES))],
            'emprunteur_reference' => ['nullable', 'string', 'max:100'],
            'emprunteur_contact' => ['nullable', 'string', 'max:100'],
            'motif' => ['nullable', 'string', 'max:255'],
            'date_sortie' => ['required', 'date'],
            'date_retour_prevue' => ['required', 'date', 'after_or_equal:date_sortie'],
        ], [
            'date_retour_prevue.after_or_equal' => 'La date de retour prévue ne peut pas précéder la date de sortie.',
        ]);

        return $this->run(function () use ($materiel, $data, $request) {
            $this->service->lend($materiel, $data, $request->user());
            ActivityLog::record('materiel_lent', "Matériel « {$materiel->nom} » prêté à {$data['emprunteur_nom']}", $materiel);
        }, 'Prêt enregistré.');
    }

    public function panne(Request $request, Materiel $materiel): RedirectResponse
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        return $this->run(function () use ($materiel, $data, $request) {
            $this->service->reportBreakdown($materiel, $data['titre'], $data['description'] ?? null, $request->user());
            ActivityLog::record('materiel_breakdown', "Panne signalée sur « {$materiel->nom} » : {$data['titre']}", $materiel);
        }, 'Panne enregistrée.');
    }

    public function maintenance(Request $request, Materiel $materiel): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['maintenance', 'reparation'])],
            'titre' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'prestataire' => ['nullable', 'string', 'max:150'],
        ]);

        return $this->run(fn () => $this->service->startMaintenance($materiel, $data['type'], $data['titre'], $data['description'] ?? null, $data['prestataire'] ?? null, $request->user()), 'Matériel mis en maintenance.');
    }

    public function terminer(Request $request, MaterielIntervention $intervention): RedirectResponse
    {
        $data = $request->validate([
            'resolution' => ['nullable', 'string', 'max:2000'],
            'cout' => ['nullable', 'integer', 'min:0', 'max:10000000000'],
        ]);

        return $this->run(fn () => $this->service->finishIntervention($intervention, $data['resolution'] ?? null, $data['cout'] ?? null, $request->user()), 'Intervention terminée : le matériel est de nouveau disponible.');
    }

    public function reformer(Request $request, Materiel $materiel): RedirectResponse
    {
        $data = $request->validate(['note' => ['nullable', 'string', 'max:500']]);

        return $this->run(function () use ($materiel, $data, $request) {
            $this->service->reform($materiel, $data['note'] ?? null, $request->user());
            ActivityLog::record('materiel_reformed', "Matériel « {$materiel->nom} » réformé", $materiel);
        }, 'Matériel réformé.');
    }

    /**
     * @param  callable(): mixed  $action
     */
    private function run(callable $action, string $success): RedirectResponse
    {
        try {
            $action();
        } catch (MaterielException $exception) {
            return back()->withErrors(['action' => $exception->getMessage()]);
        }

        return back()->with('status', $success);
    }
}
