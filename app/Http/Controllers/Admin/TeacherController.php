<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Models\Teacher;
use App\TeacherCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Enseignants/Index', [
            'teachers' => Teacher::orderBy('display_order')->get([
                'id', 'name', 'category', 'specialty_fr', 'specialty_en', 'specialty_mg',
                'description_fr', 'description_en', 'description_mg',
                'photo_path', 'email', 'display_order',
            ]),
        ]);
    }

    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['category'] = TeacherCategory::from($validated['category']);
        $validated['specialty_fr'] ??= '';

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $this->storeUploadedImage($request, 'photo', 'teachers');
        }
        unset($validated['photo']);

        Teacher::create($validated);

        return back()->with('status', 'Enseignant créé.');
    }

    public function update(Request $request, Teacher $teacher): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::enum(TeacherCategory::class)],
            'specialty_fr' => ['nullable', 'string', 'max:255'],
            'specialty_en' => ['nullable', 'string', 'max:255'],
            'specialty_mg' => ['nullable', 'string', 'max:255'],
            'description_fr' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_mg' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'photo' => ['nullable', 'image', 'max:4096'],
            'display_order' => ['nullable', 'integer'],
        ]);

        $validated['category'] = TeacherCategory::from($validated['category']);
        $validated['specialty_fr'] ??= '';

        if ($request->hasFile('photo')) {
            $this->deleteUploadedImage($teacher->photo_path, 'teachers');
            $validated['photo_path'] = $this->storeUploadedImage($request, 'photo', 'teachers');
        }
        unset($validated['photo']);

        $teacher->update($validated);

        return back()->with('status', 'Enseignant mis à jour.');
    }

    // Soft-deleted — the photo stays on disk until the admin permanently
    // deletes the teacher from the Corbeille (see Admin\TrashController).
    public function destroy(Teacher $teacher): RedirectResponse
    {
        $teacher->delete();

        return back()->with('status', 'Enseignant supprimé.');
    }
}
