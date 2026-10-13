<?php

namespace App\Models;

use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'file_path',
    ];

    /**
     * @return HasMany<DocumentDownload, $this>
     */
    public function downloads(): HasMany
    {
        return $this->hasMany(DocumentDownload::class);
    }

    /**
     * @return HasMany<DocumentInteraction, $this>
     */
    public function views(): HasMany
    {
        return $this->hasMany(DocumentInteraction::class)->where('type', DocumentInteraction::TYPE_VIEW);
    }

    /**
     * @return HasMany<DocumentInteraction, $this>
     */
    public function shares(): HasMany
    {
        return $this->hasMany(DocumentInteraction::class)->where('type', DocumentInteraction::TYPE_SHARE);
    }
}
