<?php

namespace App\Models;

use App\PreinscriptionStatus;
use Database\Factories\PreinscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Preinscription extends Model
{
    /** @use HasFactory<PreinscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenoms',
        'civilite',
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
        'nom_mere',
        'contact_parents',
        'repondant_nom',
        'repondant_lien',
        'repondant_telephone',
        'pays',
        'filiere_id',
        'niveau',
        'photo_path',
        'cin_recto_path',
        'cin_verso_path',
        'diplome_attestation_path',
        'releve_bacc_path',
        'user_id',
        'status',
        'reviewed_at',
        'motif_refus',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'status' => PreinscriptionStatus::class,
            'reviewed_at' => 'datetime',
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

    public function etudiant(): HasOne
    {
        return $this->hasOne(Etudiant::class);
    }
}
