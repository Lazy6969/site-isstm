<?php

namespace App\Models;

use App\NewsStatus;
use Database\Factories\NewsArticleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class NewsArticle extends Model
{
    /** @use HasFactory<NewsArticleFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'news_category_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'image_path',
        'author',
        'status',
        'rejection_reason',
        'validated_by',
        'validated_at',
        'is_featured',
        'views',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => NewsStatus::class,
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'validated_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'news_category_id');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
