<?php

namespace App\Models;

use App\MaterielDeplacementStatut;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterielDeplacement extends Model
{
    use HasFactory;

    protected $fillable = [
        'materiel_id',
        'lieu_origine',
        'lieu_destination',
        'motif',
        'emprunteur',
        'quantite',
        'statut',
        'date_retour',
        'cree_par',
    ];

    protected function casts(): array
    {
        return [
            'statut' => MaterielDeplacementStatut::class,
            'date_retour' => 'datetime',
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
