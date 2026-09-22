<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Models\OrgPerson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrgPersonController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Organigramme/Index', [
            'orgPeople' => OrgPerson::orderBy('sort_order')->get(),
        ]);
    }

    public function update(Request $request, OrgPerson $orgPerson): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'photo' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($request->hasFile('photo')) {
            $this->deleteUploadedImage($orgPerson->photo_path, 'organigramme');
            $validated['photo_path'] = $this->storeUploadedImage($request, 'photo', 'organigramme');
        }
        unset($validated['photo']);

        $orgPerson->update($validated);

        return back()->with('status', 'Membre mis à jour.');
    }
}
