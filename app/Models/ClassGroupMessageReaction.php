<?php

namespace App\Models;

use App\ReactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassGroupMessageReaction extends Model
{
    protected $fillable = [
        'class_group_message_id',
        'user_id',
        'type',
    ];

    protected function casts(): array
    {
        return [
            'type' => ReactionType::class,
        ];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(ClassGroupMessage::class, 'class_group_message_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
