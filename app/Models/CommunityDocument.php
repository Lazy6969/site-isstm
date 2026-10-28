<?php

namespace App\Models;

use App\CommunityDocumentStatus;
use Database\Factories\CommunityDocumentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A "Leçon" or "Sujet" (same shape, distinguished by `category`) a community
 * member uploads for the feed's left sidebar — pending Super Admin review
 * before it's visible to anyone besides its own author.
 */
class CommunityDocument extends Model
{
    /** @use HasFactory<CommunityDocumentFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category',
        'niveaux',
        'annee',
        'title',
        'file_path',
        'status',
        'rejection_reason',
        'validated_by',
        'validated_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => CommunityDocumentStatus::class,
            'niveaux' => 'array',
            'validated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsToMany<Filiere, $this>
     */
    public function filieres(): BelongsToMany
    {
        return $this->belongsToMany(Filiere::class, 'community_document_filiere');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
