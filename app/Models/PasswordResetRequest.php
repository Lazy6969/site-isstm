<?php

namespace App\Models;

use App\PasswordResetRequestStatus;
use Database\Factories\PasswordResetRequestFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A student's request to have their password reset, waiting for an administrator
 * (see Admin\PasswordResetRequestController). Accepting it gives the account the
 * temporary password and e-mails it to the student.
 */
class PasswordResetRequest extends Model
{
    /** @use HasFactory<PasswordResetRequestFactory> */
    use HasFactory;

    /**
     * The temporary password an accepted request puts on the account, until the
     * student changes it from their profile.
     */
    public const TEMPORARY_PASSWORD = '00000000';

    protected $fillable = [
        'user_id',
        'status',
        'handled_by',
        'handled_at',
        'note',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PasswordResetRequestStatus::class,
            'handled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    /**
     * @param  Builder<PasswordResetRequest>  $query
     * @return Builder<PasswordResetRequest>
     */
    public function scopeEnAttente(Builder $query): Builder
    {
        return $query->where('status', PasswordResetRequestStatus::EnAttente);
    }
}
