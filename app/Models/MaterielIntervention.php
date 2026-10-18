<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterielIntervention extends Model
{
    /**
     * @var array<string, string>
     */
    public const TYPES = [
        'panne' => 'Panne',
        'maintenance' => 'Maintenance',
        'reparation' => 'Réparation',
    ];

    protected $fillable = [
        'materiel_id',
        'type',
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'prestataire',
        'cout',
        'resolution',
        'signale_par',
        'cloture_par',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'cout' => 'integer',
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
    public function signaleur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signale_par');
    }

    /**
     * @param  Builder<MaterielIntervention>  $query
     */
    public function scopeOuvertes(Builder $query): void
    {
        $query->whereNull('date_fin');
    }

    public function isOuverte(): bool
    {
        return $this->date_fin === null;
    }
}
