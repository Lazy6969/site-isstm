<?php

namespace App\Models;

use App\GalleryStatus;
use Database\Factories\GalleryAlbumFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GalleryAlbum extends Model
{
    /** @use HasFactory<GalleryAlbumFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'gallery_category_id',
        'title',
        'slug',
        'description',
        'cover_image',
        'event_date',
        'location',
        'author',
        'status',
        'rejection_reason',
        'validated_by',
        'validated_at',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => GalleryStatus::class,
            'event_date' => 'date',
            'published_at' => 'datetime',
            'validated_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(GalleryCategory::class, 'gallery_category_id');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(GalleryPhoto::class)->orderBy('display_order');
    }
}
