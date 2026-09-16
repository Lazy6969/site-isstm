<?php

namespace App\Models;

use Database\Factories\GalleryPhotoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GalleryPhoto extends Model
{
    /** @use HasFactory<GalleryPhotoFactory> */
    use HasFactory;

    protected $fillable = [
        'gallery_album_id',
        'image_path',
        'title',
        'alt_text',
        'display_order',
    ];
}
