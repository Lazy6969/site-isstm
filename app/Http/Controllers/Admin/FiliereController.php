<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFiliereRequest;
use App\Models\Filiere;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FiliereController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Filieres/Index', [
            'filieres' => Filiere::orderBy('display_order')->orderBy('nom_fr')->get([
                'id', 'code', 'mention', 'niveaux', 'slug',
                'nom_fr', 'nom_en', 'nom_mg',
                'description_fr', 'description_en', 'description_mg',
                'debouches_fr', 'debouches_en', 'debouches_mg',
                'historique_fr', 'historique_en', 'historique_mg',
                'avantages_fr', 'avantages_en', 'avantages_mg',
                'image_path', 'display_order',
            ]),
        ]);
    }

    public function store(StoreFiliereRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['slug'] = $this->uniqueSlug($validated['nom_fr']);
        $validated['display_order'] = $validated['display_order'] ?? 0;

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'filieres');
        }
        unset($validated['image']);

        Filiere::create($validated);

        return back()->with('status', 'Filière créée.');
    }

    public function update(Request $request, Filiere $filiere): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20'],
            'mention' => ['nullable', 'string', 'max:100'],
            'niveaux' => ['nullable', 'string', 'max:50'],
            'nom_fr' => ['required', 'string', 'max:255'],
            'nom_en' => ['nullable', 'string', 'max:255'],
            'nom_mg' => ['nullable', 'string', 'max:255'],
            'description_fr' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_mg' => ['nullable', 'string'],
            'debouches_fr' => ['nullable', 'string'],
            'debouches_en' => ['nullable', 'string'],
            'debouches_mg' => ['nullable', 'string'],
            'historique_fr' => ['nullable', 'string'],
            'historique_en' => ['nullable', 'string'],
            'historique_mg' => ['nullable', 'string'],
            'avantages_fr' => ['nullable', 'string'],
            'avantages_en' => ['nullable', 'string'],
            'avantages_mg' => ['nullable', 'string'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $validated['display_order'] = $validated['display_order'] ?? 0;

        if ($request->hasFile('image')) {
            $this->deleteUploadedImage($filiere->image_path, 'filieres');
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'filieres');
        }
        unset($validated['image']);

        $filiere->update($validated);

        return back()->with('status', 'Filière mise à jour.');
    }

    public function destroy(Filiere $filiere): RedirectResponse
    {
        $this->deleteUploadedImage($filiere->image_path, 'filieres');
        $filiere->delete();

        return back()->with('status', 'Filière supprimée.');
    }

    private function uniqueSlug(string $nom): string
    {
        $base = Str::slug($nom);
        $slug = $base;
        $suffix = 1;

        while (Filiere::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
