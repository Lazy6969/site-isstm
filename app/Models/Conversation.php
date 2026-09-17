<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'user_one_id',
        'user_two_id',
    ];

    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function otherUser(User $user): User
    {
        return $this->user_one_id === $user->id ? $this->userTwo : $this->userOne;
    }

    public function involves(User $user): bool
    {
        return $this->user_one_id === $user->id || $this->user_two_id === $user->id;
    }
}
