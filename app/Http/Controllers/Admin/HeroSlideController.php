<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHeroSlideRequest;
use App\MediaType;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class HeroSlideController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/HeroSlides/Index', [
            'heroSlides' => HeroSlide::orderBy('display_order')->get(['id', 'image_path', 'media_type', 'display_order']),
        ]);
    }

    public function store(StoreHeroSlideRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['media_type'] = $this->mediaTypeOf($request->file('media'));
        $validated['image_path'] = $this->storeUploadedImage($request, 'media', 'hero');
        unset($validated['media']);

        HeroSlide::create($validated);

        return back()->with('status', 'Diapositive ajoutée.');
    }

    public function update(Request $request, HeroSlide $heroSlide): RedirectResponse
    {
        $validated = $request->validate([
            'display_order' => ['nullable', 'integer'],
            'media' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,gif,mp4,mov,webm', 'max:20480'],
        ]);

        if ($request->hasFile('media')) {
            $this->deleteUploadedImage($heroSlide->image_path, 'hero');
            $validated['image_path'] = $this->storeUploadedImage($request, 'media', 'hero');
            $validated['media_type'] = $this->mediaTypeOf($request->file('media'));
        }
        unset($validated['media']);

        $heroSlide->update($validated);

        return back()->with('status', 'Diapositive mise à jour.');
    }

    /**
     * 'image' or 'video', from the uploaded file's real MIME type — the
     * admin doesn't pick a type explicitly, it's detected from what they
     * upload (StoreHeroSlideRequest's mimes rule already rejects anything
     * else, e.g. a PDF, before this ever runs).
     */
    private function mediaTypeOf(UploadedFile $file): string
    {
        return MediaType::fromMimeType($file->getMimeType()) === MediaType::Video ? 'video' : 'image';
    }

    public function destroy(HeroSlide $heroSlide): RedirectResponse
    {
        $this->deleteUploadedImage($heroSlide->image_path, 'hero');
        $heroSlide->delete();

        return back()->with('status', 'Diapositive supprimée.');
    }
}
