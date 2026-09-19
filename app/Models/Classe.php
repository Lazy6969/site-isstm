<?php

namespace App\Models;

use Database\Factories\ClasseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classe extends Model
{
    /** @use HasFactory<ClasseFactory> */
    use HasFactory;

    protected $fillable = [
        'nom',
        'filiere_id',
        'niveau',
        'annee',
        'effectif_max',
    ];

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function etudiants(): HasMany
    {
        return $this->hasMany(Etudiant::class);
    }

    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }
}
