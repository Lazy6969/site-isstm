<?php

namespace App\Models;

use App\StatutEtudiant;
use Database\Factories\EtudiantFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Etudiant extends Model
{
    /** @use HasFactory<EtudiantFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'preinscription_id',
        'classe_id',
        'matricule',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'statut' => StatutEtudiant::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function preinscription(): BelongsTo
    {
        return $this->belongsTo(Preinscription::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }
}
