<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampusBlocRequest;
use App\Models\CampusBloc;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CampusBlocController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Campus/Index', [
            'blocs' => CampusBloc::orderBy('nom')->get([
                'id', 'bloc_key', 'nom', 'signification', 'fondation', 'fondateurs',
                'slogan', 'objectifs', 'activites', 'danse', 'mampiavaka', 'images',
            ]),
        ]);
    }

    public function store(StoreCampusBlocRequest $request): RedirectResponse
    {
        CampusBloc::create($request->validated());

        return back()->with('status', 'Bloc créé.');
    }

    public function update(Request $request, CampusBloc $bloc): RedirectResponse
    {
        $validated = $request->validate([
            'bloc_key' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('campus_blocs', 'bloc_key')->ignore($bloc->id)],
            'nom' => ['required', 'string', 'max:255'],
            'signification' => ['nullable', 'string'],
            'fondation' => ['nullable', 'string', 'max:255'],
            'fondateurs' => ['nullable', 'string', 'max:255'],
            'slogan' => ['nullable', 'string', 'max:255'],
            'objectifs' => ['nullable', 'string'],
            'activites' => ['nullable', 'string'],
            'danse' => ['nullable', 'string', 'max:255'],
            'mampiavaka' => ['nullable', 'string', 'max:255'],
        ]);

        $bloc->update($validated);

        return back()->with('status', 'Bloc mis à jour.');
    }

    public function destroy(CampusBloc $bloc): RedirectResponse
    {
        foreach ($bloc->images ?? [] as $image) {
            $this->deleteUploadedImage($image, 'campus');
        }
        $bloc->delete();

        return back()->with('status', 'Bloc supprimé.');
    }

    public function storePhotos(Request $request, CampusBloc $bloc): RedirectResponse
    {
        $validated = $request->validate([
            'photos' => ['required', 'array', 'min:1'],
            'photos.*' => ['image', 'max:4096'],
        ]);

        $images = $bloc->images ?? [];
        foreach ($validated['photos'] as $file) {
            $images[] = 'storage/'.$file->store('campus', 'public');
        }

        $bloc->update(['images' => $images]);

        return back()->with('status', 'Photo(s) ajoutée(s).');
    }

    public function destroyPhoto(CampusBloc $bloc, int $index): RedirectResponse
    {
        $images = $bloc->images ?? [];

        abort_unless(array_key_exists($index, $images), 404);

        $this->deleteUploadedImage($images[$index], 'campus');
        unset($images[$index]);

        $bloc->update(['images' => array_values($images)]);

        return back()->with('status', 'Photo supprimée.');
    }
}
