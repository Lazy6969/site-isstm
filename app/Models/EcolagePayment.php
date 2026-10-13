<?php

namespace App\Models;

use App\EcolageStatus;
use Database\Factories\EcolagePaymentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EcolagePayment extends Model
{
    /** @use HasFactory<EcolagePaymentFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * What a versement pays for, mirroring the fee schedule on the Inscription page.
     *
     * @var array<string, string>
     */
    public const TYPES = [
        'droit' => "Droit d'inscription",
        'v1' => '1er versement',
        'v2' => '2e versement',
        'v3' => '3e versement',
        'tenue' => 'Tenue',
        'autre' => 'Autre',
    ];

    /**
     * @var array<string, string>
     */
    public const MODES = [
        'banque' => 'Versement bancaire',
        'mobile' => 'Mobile money',
        'especes' => 'Espèces à la scolarité',
    ];

    protected $fillable = [
        'etudiant_id',
        'annee_universitaire',
        'type',
        'mode',
        'amount',
        'reference',
        'paid_at',
        'receipt_path',
        'card_path',
        'status',
        'reviewed_by',
        'reviewed_at',
        'motif_refus',
    ];

    protected function casts(): array
    {
        return [
            'status' => EcolageStatus::class,
            'paid_at' => 'date',
            'reviewed_at' => 'datetime',
            'amount' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Etudiant, $this>
     */
    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * A reference is the bank's own proof number: it must never be counted twice,
     * so a refused payment frees its reference for a corrected re-submission.
     *
     * @param  Builder<EcolagePayment>  $query
     */
    public function scopeHoldingReference(Builder $query, string $reference): void
    {
        $query->where('reference', $reference)->where('status', '!=', EcolageStatus::Refuse->value);
    }

    /**
     * The université year the current date falls in, e.g. "2025-2026" from September on.
     */
    public static function currentAcademicYear(): string
    {
        $now = now();
        $start = $now->month >= 9 ? $now->year : $now->year - 1;

        return $start.'-'.($start + 1);
    }
}
