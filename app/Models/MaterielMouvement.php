<?php

namespace App\Models;

use App\MaterielMouvementType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterielMouvement extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'materiel_id',
        'type',
        'de',
        'vers',
        'note',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'type' => MaterielMouvementType::class,
        ];
    }

    /**
     * @return BelongsTo<Materiel, $this>
     */
    public function materiel(): BelongsTo
    {
        return $this->belongsTo(Materiel::class)->withTrashed();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
