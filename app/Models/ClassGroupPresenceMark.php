<?php

namespace App\Models;

use App\PresenceStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassGroupPresenceMark extends Model
{
    protected $fillable = [
        'session_id',
        'user_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => PresenceStatus::class,
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(ClassGroupPresenceSession::class, 'session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
