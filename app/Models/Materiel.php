<?php

namespace App\Models;

use App\MaterielEtat;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Materiel extends Model
{
    use HasFactory;

    protected $fillable = [
        'lieu',
        'nom',
        'quantite',
        'etat',
        'observation',
        'ajoute_par',
    ];

    protected function casts(): array
    {
        return [
            'etat' => MaterielEtat::class,
        ];
    }

    public function ajoutePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ajoute_par');
    }

    public function deplacements(): HasMany
    {
        return $this->hasMany(MaterielDeplacement::class);
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(MaterielMaintenance::class);
    }
}
