<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassGroupMessage extends Model
{
    protected $fillable = [
        'class_group_id',
        'sender_id',
        'body',
    ];

    protected function casts(): array
    {
        return [
            'deleted_for_everyone_at' => 'datetime',
        ];
    }

    public function classGroup(): BelongsTo
    {
        return $this->belongsTo(ClassGroup::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ClassGroupMessageAttachment::class, 'message_id');
    }

    public function hiddenFor(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_group_message_hides', 'message_id');
    }
}
