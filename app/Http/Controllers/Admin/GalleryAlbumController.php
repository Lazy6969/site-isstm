<?php

namespace App\Http\Controllers\Admin;

use App\GalleryStatus;
use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGalleryAlbumRequest;
use App\Models\ActivityLog;
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
                'validator:id,name',
                'photos:id,gallery_album_id,image_path,title,alt_text,display_order',
            ])
                ->orderByDesc('created_at')
                ->get(['id', 'gallery_category_id', 'title', 'slug', 'description', 'cover_image', 'event_date', 'location', 'author', 'status', 'rejection_reason', 'validated_by', 'validated_at', 'created_at']),
            'categories' => GalleryCategory::orderBy('name_fr')->get(['id', 'name_fr']),
        ]);
    }

    public function store(StoreGalleryAlbumRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['status'] = GalleryStatus::from($validated['status']);

        $this->applyValidationWorkflow($request, $validated);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $this->storeUploadedImage($request, 'cover_image', 'galerie');
        }

        GalleryAlbum::create($validated);

        return back()->with('status', $validated['status'] === GalleryStatus::EnAttente ? 'Album soumis pour validation.' : 'Album créé.');
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

        $this->applyValidationWorkflow($request, $validated, $album);

        if ($request->hasFile('cover_image')) {
            $this->deleteUploadedImage($album->cover_image, 'galerie');
            $validated['cover_image'] = $this->storeUploadedImage($request, 'cover_image', 'galerie');
        }

        $album->update($validated);

        return back()->with('status', $validated['status'] === GalleryStatus::EnAttente ? 'Album soumis pour validation.' : 'Album mis à jour.');
    }

    public function approve(Request $request, GalleryAlbum $album): RedirectResponse
    {
        abort_unless($album->status === GalleryStatus::EnAttente, 409, "Cet album n'est pas en attente de validation.");

        $album->update([
            'status' => GalleryStatus::Publie,
            'rejection_reason' => null,
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
            'published_at' => $album->published_at ?? now(),
        ]);

        ActivityLog::record('gallery_validated', "Album « {$album->title} » validé et publié", $album);

        return back()->with('status', 'Album validé et publié.');
    }

    public function reject(Request $request, GalleryAlbum $album): RedirectResponse
    {
        abort_unless($album->status === GalleryStatus::EnAttente, 409, "Cet album n'est pas en attente de validation.");

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $album->update([
            'status' => GalleryStatus::Rejete,
            'rejection_reason' => $validated['rejection_reason'],
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        ActivityLog::record('gallery_rejected', "Album « {$album->title} » rejeté", $album, ['reason' => $validated['rejection_reason']]);

        return back()->with('status', 'Album rejeté.');
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

    /**
     * A creator/editor without `gallery.publish` cannot take an album straight to
     * Publié/Archivé/Rejeté — anything but Brouillon gets downgraded to En attente
     * for a publisher to review. Mutates $validated in place.
     *
     * @param  array<string, mixed>  $validated
     */
    private function applyValidationWorkflow(Request $request, array &$validated, ?GalleryAlbum $album = null): void
    {
        if ($request->user()->can('gallery.publish')) {
            if ($validated['status'] === GalleryStatus::Publie && $album?->published_at === null) {
                $validated['published_at'] = now();
            }
            if ($validated['status'] === GalleryStatus::Publie) {
                $validated['validated_by'] = $request->user()->id;
                $validated['validated_at'] = now();
                $validated['rejection_reason'] = null;
            }

            return;
        }

        if ($validated['status'] !== GalleryStatus::Brouillon) {
            $validated['status'] = GalleryStatus::EnAttente;
            $validated['rejection_reason'] = null;
        }
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
