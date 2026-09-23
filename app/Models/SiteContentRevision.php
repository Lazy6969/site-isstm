<?php

namespace App\Models;

use App\SiteContentType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteContentRevision extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'site_content_id',
        'content_key',
        'type',
        'content_value_fr',
        'content_value_en',
        'content_value_mg',
        'changed_by',
    ];

    protected function casts(): array
    {
        return [
            'type' => SiteContentType::class,
        ];
    }

    public function siteContent(): BelongsTo
    {
        return $this->belongsTo(SiteContent::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * A snapshot of $content's current values, taken right before the caller
     * overwrites them — the resulting row is "what it looked like before".
     */
    public static function snapshot(SiteContent $content, ?User $changedBy): void
    {
        static::create([
            'site_content_id' => $content->id,
            'content_key' => $content->content_key,
            'type' => $content->type,
            'content_value_fr' => $content->content_value_fr,
            'content_value_en' => $content->content_value_en,
            'content_value_mg' => $content->content_value_mg,
            'changed_by' => $changedBy?->id,
        ]);
    }
}
