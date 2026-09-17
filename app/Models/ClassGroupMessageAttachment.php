<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassGroupMessageAttachment extends Model
{
    protected $fillable = [
        'message_id',
        'path',
        'original_name',
        'file_type',
        'mime_type',
        'file_size',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(ClassGroupMessage::class, 'message_id');
    }
}
