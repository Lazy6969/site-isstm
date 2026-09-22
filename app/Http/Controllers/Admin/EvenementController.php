<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEvenementRequest;
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
            'evenements' => Evenement::orderByDesc('date_debut')
                ->get(['id', 'titre', 'description', 'date_debut', 'date_fin', 'lieu', 'image_path', 'categorie']),
        ]);
    }

    public function store(StoreEvenementRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'evenements');
        }
        unset($validated['image']);

        Evenement::create($validated);

        return back()->with('status', 'Événement créé.');
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
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($request->hasFile('image')) {
            $this->deleteUploadedImage($evenement->image_path, 'evenements');
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'evenements');
        }
        unset($validated['image']);

        $evenement->update($validated);

        return back()->with('status', 'Événement mis à jour.');
    }

    public function destroy(Evenement $evenement): RedirectResponse
    {
        $this->deleteUploadedImage($evenement->image_path, 'evenements');
        $evenement->delete();

        return back()->with('status', 'Événement supprimé.');
    }
}
