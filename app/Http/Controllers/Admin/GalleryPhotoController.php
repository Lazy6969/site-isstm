<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Models\GalleryAlbum;
use App\Models\GalleryPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GalleryPhotoController extends Controller
{
    use ManagesUploadedImages;

    public function store(Request $request, GalleryAlbum $album): RedirectResponse
    {
        $validated = $request->validate([
            'photos' => ['required', 'array', 'min:1'],
            'photos.*' => ['image', 'max:4096'],
        ]);

        $nextOrder = (int) $album->photos()->max('display_order') + 1;

        foreach ($validated['photos'] as $index => $file) {
            GalleryPhoto::create([
                'gallery_album_id' => $album->id,
                'image_path' => 'storage/'.$file->store('galerie', 'public'),
                'display_order' => $nextOrder + $index,
            ]);
        }

        return back()->with('status', 'Photo(s) ajoutée(s).');
    }

    public function destroy(GalleryPhoto $photo): RedirectResponse
    {
        $this->deleteUploadedImage($photo->image_path, 'galerie');
        $photo->delete();

        return back()->with('status', 'Photo supprimée.');
    }
}
