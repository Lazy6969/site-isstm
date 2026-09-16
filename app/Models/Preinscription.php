<?php

namespace App\Models;

use App\PreinscriptionStatus;
use Database\Factories\PreinscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Preinscription extends Model
{
    /** @use HasFactory<PreinscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenoms',
        'sexe',
        'date_naissance',
        'lieu_naissance',
        'cin',
        'nationalite',
        'annee_bacc',
        'serie_bacc',
        'serie_bacc_autre',
        'mention_bacc',
        'code_redoublement',
        'adresse',
        'telephone',
        'email',
        'nom_pere',
        'profession_pere',
        'nom_mere',
        'profession_mere',
        'adresse_parents',
        'contact_parents',
        'contact_parents_2',
        'pays',
        'filiere_id',
        'niveau',
        'photo_path',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'status' => PreinscriptionStatus::class,
        ];
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
