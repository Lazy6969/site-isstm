<?php

namespace App\Http\Controllers\Admin;

use App\EvenementStatus;
use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEvenementRequest;
use App\Models\ActivityLog;
use App\Models\Evenement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EvenementController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Evenements/Index', [
            'evenements' => Evenement::with('validator:id,name')
                ->orderByDesc('date_debut')
                ->get(['id', 'titre', 'description', 'date_debut', 'date_fin', 'lieu', 'image_path', 'categorie', 'status', 'rejection_reason', 'validated_by', 'validated_at']),
        ]);
    }

    public function store(StoreEvenementRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['status'] = isset($validated['status']) ? EvenementStatus::from($validated['status']) : EvenementStatus::Publie;

        $this->applyValidationWorkflow($request, $validated);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'evenements');
        }
        unset($validated['image']);

        Evenement::create($validated);

        return back()->with('status', $validated['status'] === EvenementStatus::EnAttente ? 'Événement soumis pour validation.' : 'Événement créé.');
    }

    public function update(Request $request, Evenement $evenement): RedirectResponse
    {
        $validated = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'lieu' => ['nullable', 'string', 'max:255'],
            'categorie' => ['required', Rule::in(['general', 'examen', 'ceremonie', 'atelier', 'vacances', 'inscription'])],
            'status' => ['nullable', Rule::enum(EvenementStatus::class)],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $validated['status'] = isset($validated['status']) ? EvenementStatus::from($validated['status']) : $evenement->status;

        $this->applyValidationWorkflow($request, $validated, $evenement);

        if ($request->hasFile('image')) {
            $this->deleteUploadedImage($evenement->image_path, 'evenements');
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'evenements');
        }
        unset($validated['image']);

        $evenement->update($validated);

        return back()->with('status', $validated['status'] === EvenementStatus::EnAttente ? 'Événement soumis pour validation.' : 'Événement mis à jour.');
    }

    public function approve(Request $request, Evenement $evenement): RedirectResponse
    {
        abort_unless($evenement->status === EvenementStatus::EnAttente, 409, "Cet événement n'est pas en attente de validation.");

        $evenement->update([
            'status' => EvenementStatus::Publie,
            'rejection_reason' => null,
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        ActivityLog::record('evenement_validated', "Événement « {$evenement->titre} » validé et publié", $evenement);

        return back()->with('status', 'Événement validé et publié.');
    }

    public function reject(Request $request, Evenement $evenement): RedirectResponse
    {
        abort_unless($evenement->status === EvenementStatus::EnAttente, 409, "Cet événement n'est pas en attente de validation.");

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $evenement->update([
            'status' => EvenementStatus::Rejete,
            'rejection_reason' => $validated['rejection_reason'],
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        ActivityLog::record('evenement_rejected', "Événement « {$evenement->titre} » rejeté", $evenement, ['reason' => $validated['rejection_reason']]);

        return back()->with('status', 'Événement rejeté.');
    }

    public function destroy(Evenement $evenement): RedirectResponse
    {
        $this->deleteUploadedImage($evenement->image_path, 'evenements');
        $evenement->delete();

        return back()->with('status', 'Événement supprimé.');
    }

    /**
     * A creator/editor without `evenements.publish` cannot take an event straight to
     * Publié/Archivé/Rejeté — anything but Brouillon gets downgraded to En attente
     * for a publisher to review. Mutates $validated in place.
     *
     * @param  array<string, mixed>  $validated
     */
    private function applyValidationWorkflow(Request $request, array &$validated, ?Evenement $evenement = null): void
    {
        if ($request->user()->can('evenements.publish')) {
            if ($validated['status'] === EvenementStatus::Publie) {
                $validated['validated_by'] = $request->user()->id;
                $validated['validated_at'] = now();
                $validated['rejection_reason'] = null;
            }

            return;
        }

        if ($validated['status'] !== EvenementStatus::Brouillon) {
            $validated['status'] = EvenementStatus::EnAttente;
            $validated['rejection_reason'] = null;
        }
    }
}
