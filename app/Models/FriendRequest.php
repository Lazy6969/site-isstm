<?php

namespace App\Models;

use App\FriendRequestStatus;
use Database\Factories\FriendRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FriendRequest extends Model
{
    /** @use HasFactory<FriendRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'recipient_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => FriendRequestStatus::class,
        ];
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
