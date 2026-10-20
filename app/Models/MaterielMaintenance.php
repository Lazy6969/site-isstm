<?php

namespace App\Models;

use App\MaterielEtat;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterielMaintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'materiel_id',
        'description',
        'etat_apres',
        'cree_par',
    ];

    protected function casts(): array
    {
        return [
            'etat_apres' => MaterielEtat::class,
        ];
    }

    public function materiel(): BelongsTo
    {
        return $this->belongsTo(Materiel::class);
    }

    public function creePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cree_par');
    }
}
