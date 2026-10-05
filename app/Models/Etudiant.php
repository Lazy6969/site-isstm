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
        'candidat_id',
        'classe_id',
        'matricule',
        'statut',
        'nom',
        'prenoms',
        'civilite',
        'sexe',
        'date_naissance',
        'lieu_naissance',
        'cin',
        'nationalite',
        'pays',
        'adresse',
        'telephone',
        'nom_pere',
        'nom_mere',
        'contact_parents',
        'repondant_nom',
        'repondant_lien',
        'repondant_telephone',
    ];

    protected function casts(): array
    {
        return [
            'statut' => StatutEtudiant::class,
            'date_naissance' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function candidat(): BelongsTo
    {
        return $this->belongsTo(Candidat::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }

    /**
     * ISSTM-{année}-{séquence sur 5 chiffres}, ex: ISSTM-2026-00042. La séquence
     * repart de 1 chaque année. Léger risque de collision sous approbations
     * concurrentes, accepté vu le volume (validation manuelle, un clic à la fois).
     */
    public static function generateMatricule(): string
    {
        $year = now()->year;
        $count = static::query()->where('matricule', 'like', "ISSTM-{$year}-%")->count() + 1;

        return sprintf('ISSTM-%d-%05d', $year, $count);
    }
}
