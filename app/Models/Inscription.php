<?php

namespace App\Models;

use App\StatutInscription;
use Database\Factories\InscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inscription extends Model
{
    /** @use HasFactory<InscriptionFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'etudiant_id',
        'classe_id',
        'annee',
        'numero',
        'statut',
        'date_inscription',
    ];

    protected function casts(): array
    {
        return [
            'statut' => StatutInscription::class,
            'date_inscription' => 'date',
        ];
    }

    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }
}
