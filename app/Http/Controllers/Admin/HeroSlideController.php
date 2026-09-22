<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHeroSlideRequest;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HeroSlideController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/HeroSlides/Index', [
            'heroSlides' => HeroSlide::orderBy('display_order')->get(['id', 'image_path', 'display_order']),
        ]);
    }

    public function store(StoreHeroSlideRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['media_type'] = 'image';
        $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'hero');
        unset($validated['image']);

        HeroSlide::create($validated);

        return back()->with('status', 'Diapositive ajoutée.');
    }

    public function update(Request $request, HeroSlide $heroSlide): RedirectResponse
    {
        $validated = $request->validate([
            'display_order' => ['nullable', 'integer'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($request->hasFile('image')) {
            $this->deleteUploadedImage($heroSlide->image_path, 'hero');
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'hero');
        }
        unset($validated['image']);

        $heroSlide->update($validated);

        return back()->with('status', 'Diapositive mise à jour.');
    }

    public function destroy(HeroSlide $heroSlide): RedirectResponse
    {
        $this->deleteUploadedImage($heroSlide->image_path, 'hero');
        $heroSlide->delete();

        return back()->with('status', 'Diapositive supprimée.');
    }
}
