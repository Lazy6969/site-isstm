<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentInteraction extends Model
{
    public const TYPE_VIEW = 'view';

    public const TYPE_SHARE = 'share';

    protected $fillable = [
        'document_id',
        'user_id',
        'type',
        'ip_address',
    ];

    /**
     * @return BelongsTo<Document, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class)->withTrashed();
    }
}
