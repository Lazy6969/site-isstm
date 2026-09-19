<?php

namespace App\Http\Controllers\Admin;

use App\GalleryStatus;
use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGalleryAlbumRequest;
use App\Models\GalleryAlbum;
use App\Models\GalleryCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GalleryAlbumController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Galerie/Index', [
            'albums' => GalleryAlbum::with([
                'category:id,name_fr',
                'photos:id,gallery_album_id,image_path,title,alt_text,display_order',
            ])
                ->orderByDesc('created_at')
                ->get(['id', 'gallery_category_id', 'title', 'slug', 'description', 'cover_image', 'event_date', 'location', 'author', 'status', 'created_at']),
            'categories' => GalleryCategory::orderBy('name_fr')->get(['id', 'name_fr']),
        ]);
    }

    public function store(StoreGalleryAlbumRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['status'] = GalleryStatus::from($validated['status']);

        if ($validated['status'] === GalleryStatus::Publie) {
            $validated['published_at'] = now();
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $this->storeUploadedImage($request, 'cover_image', 'galerie');
        }

        GalleryAlbum::create($validated);

        return back()->with('status', 'Album créé.');
    }

    public function update(Request $request, GalleryAlbum $album): RedirectResponse
    {
        $validated = $request->validate([
            'gallery_category_id' => ['nullable', 'exists:gallery_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event_date' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:150'],
            'status' => ['required', Rule::enum(GalleryStatus::class)],
            'cover_image' => ['nullable', 'image', 'max:4096'],
        ]);

        $validated['status'] = GalleryStatus::from($validated['status']);

        if ($validated['status'] === GalleryStatus::Publie && $album->published_at === null) {
            $validated['published_at'] = now();
        }

        if ($request->hasFile('cover_image')) {
            $this->deleteUploadedImage($album->cover_image, 'galerie');
            $validated['cover_image'] = $this->storeUploadedImage($request, 'cover_image', 'galerie');
        }

        $album->update($validated);

        return back()->with('status', 'Album mis à jour.');
    }

    public function destroy(GalleryAlbum $album): RedirectResponse
    {
        $album->loadMissing('photos');

        $this->deleteUploadedImage($album->cover_image, 'galerie');
        foreach ($album->photos as $photo) {
            $this->deleteUploadedImage($photo->image_path, 'galerie');
        }

        $album->delete();

        return back()->with('status', 'Album supprimé.');
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 1;

        while (GalleryAlbum::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
