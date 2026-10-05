<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartenaireRequest;
use App\Models\Partenaire;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartenaireController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Partenaires/Index', [
            'partenaires' => Partenaire::orderBy('display_order')
                ->get(['id', 'nom', 'logo_path', 'site_url', 'display_order']),
        ]);
    }

    public function store(StorePartenaireRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // site_url/logo_path are NOT NULL columns with no default, but are
        // optional from the admin's perspective — default them to an empty
        // string rather than leaving them unset.
        $validated['site_url'] = $validated['site_url'] ?? '';

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $this->storeUploadedImage($request, 'logo', 'partenaires');
        }
        unset($validated['logo']);
        $validated['logo_path'] = $validated['logo_path'] ?? '';

        Partenaire::create($validated);

        return back()->with('status', 'Partenaire créé.');
    }

    public function update(Request $request, Partenaire $partenaire): RedirectResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'site_url' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'image', 'max:4096'],
            'display_order' => ['nullable', 'integer'],
        ]);

        // Only coerce null -> '' for keys actually present in the payload
        // (NOT NULL column), leaving untouched fields untouched.
        if (array_key_exists('site_url', $validated)) {
            $validated['site_url'] = $validated['site_url'] ?? '';
        }

        if ($request->hasFile('logo')) {
            $this->deleteUploadedImage($partenaire->logo_path, 'partenaires');
            $validated['logo_path'] = $this->storeUploadedImage($request, 'logo', 'partenaires');
        }
        unset($validated['logo']);

        $partenaire->update($validated);

        return back()->with('status', 'Partenaire mis à jour.');
    }

    // Soft-deleted — the logo stays on disk until the admin permanently
    // deletes the partenaire from the Corbeille (see Admin\TrashController).
    public function destroy(Partenaire $partenaire): RedirectResponse
    {
        $partenaire->delete();

        return back()->with('status', 'Partenaire supprimé.');
    }
}
