<?php

namespace App\Http\Controllers;

use App\GalleryStatus;
use App\Models\GalleryAlbum;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(): Response
    {
        $albums = GalleryAlbum::query()
            ->with('category:id,name_fr,icon')
            ->where('status', GalleryStatus::Publie)
            ->orderByDesc('event_date')
            ->withCount('photos')
            ->get(['id', 'gallery_category_id', 'title', 'slug', 'cover_image', 'event_date', 'location']);

        return Inertia::render('Galerie/Index', ['albums' => $albums]);
    }

    public function show(GalleryAlbum $album): Response
    {
        abort_unless($album->status === GalleryStatus::Publie, 404);

        $album->load(['category:id,name_fr,icon', 'photos:id,gallery_album_id,image_path,title,alt_text,display_order']);

        return Inertia::render('Galerie/Show', ['album' => $album]);
    }
}
