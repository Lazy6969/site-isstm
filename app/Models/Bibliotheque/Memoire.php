<?php

namespace App\Models\Bibliotheque;

use App\MemoireCategorie;
use Database\Factories\Bibliotheque\MemoireFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Memoire extends Model
{
    /** @use HasFactory<MemoireFactory> */
    use HasFactory;

    protected $connection = 'bibliotheque';

    protected $fillable = [
        'titre',
        'auteur',
        'encadreur',
        'categorie',
        'filiere_id',
        'annee_id',
        'resume',
        'chemin_fichier',
    ];

    protected function casts(): array
    {
        return [
            'categorie' => MemoireCategorie::class,
        ];
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function annee(): BelongsTo
    {
        return $this->belongsTo(AnneeUniversitaire::class, 'annee_id');
    }
}
