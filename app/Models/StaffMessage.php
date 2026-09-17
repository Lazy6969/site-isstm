<?php

namespace App\Models;

use Database\Factories\StaffMessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StaffMessage extends Model
{
    /** @use HasFactory<StaffMessageFactory> */
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'body',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'deleted_for_everyone_at' => 'datetime',
        ];
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(StaffMessageAttachment::class, 'message_id');
    }

    public function hiddenFor(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'staff_message_hides', 'message_id');
    }
}
