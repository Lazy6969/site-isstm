<?php

namespace App\Models;

use App\ReactivationStatus;
use Database\Factories\ReactivationRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReactivationRequest extends Model
{
    /** @use HasFactory<ReactivationRequestFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'status',
        'reviewed_by',
        'reviewed_at',
        'motif_refus',
    ];

    protected function casts(): array
    {
        return [
            'status' => ReactivationStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
