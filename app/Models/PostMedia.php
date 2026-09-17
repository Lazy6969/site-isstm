<?php

namespace App\Models;

use App\MediaType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostMedia extends Model
{
    protected $fillable = [
        'post_id',
        'path',
        'type',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'type' => MediaType::class,
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
