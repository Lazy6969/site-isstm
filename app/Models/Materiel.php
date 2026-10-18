<?php

namespace App\Models;

use App\MaterielStatut;
use Database\Factories\MaterielFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One piece of ISSTM equipment. Its statut is only ever changed through
 * App\Services\MaterielService, which also writes the matching history entry.
 */
class Materiel extends Model
{
    /** @use HasFactory<MaterielFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @var array<string, string>
     */
    public const CATEGORIES = [
        'informatique' => 'Informatique',
        'audiovisuel' => 'Audiovisuel',
        'mobilier' => 'Mobilier',
        'laboratoire' => 'Laboratoire',
        'reseau' => 'Réseau & électricité',
        'sport' => 'Sport & loisirs',
        'bureautique' => 'Bureautique',
        'autre' => 'Autre',
    ];

    protected $fillable = [
        'code',
        'nom',
        'categorie',
        'marque',
        'modele',
        'numero_serie',
        'statut',
        'localisation',
        'date_acquisition',
        'valeur',
        'notes',
        'photo_path',
    ];

    protected function casts(): array
    {
        return [
            'statut' => MaterielStatut::class,
            'date_acquisition' => 'date',
            'valeur' => 'integer',
        ];
    }

    /**
     * @return HasMany<MaterielMouvement, $this>
     */
    public function mouvements(): HasMany
    {
        return $this->hasMany(MaterielMouvement::class)->latest('created_at')->latest('id');
    }

    /**
     * @return HasMany<MaterielEmprunt, $this>
     */
    public function emprunts(): HasMany
    {
        return $this->hasMany(MaterielEmprunt::class)->latest('date_sortie')->latest('id');
    }

    /**
     * @return HasOne<MaterielEmprunt, $this>
     */
    public function empruntEnCours(): HasOne
    {
        return $this->hasOne(MaterielEmprunt::class)->whereNull('date_retour_effective')->latestOfMany();
    }

    /**
     * @return HasMany<MaterielIntervention, $this>
     */
    public function interventions(): HasMany
    {
        return $this->hasMany(MaterielIntervention::class)->latest('date_debut')->latest('id');
    }

    /**
     * @return HasOne<MaterielIntervention, $this>
     */
    public function interventionOuverte(): HasOne
    {
        return $this->hasOne(MaterielIntervention::class)->whereNull('date_fin')->latestOfMany();
    }

    /**
     * MAT-{année}-{séquence sur 5 chiffres}, la séquence repartant de 1 chaque année.
     */
    public static function generateCode(): string
    {
        $year = now()->year;
        $count = static::withTrashed()->where('code', 'like', "MAT-{$year}-%")->count() + 1;

        do {
            $code = sprintf('MAT-%d-%05d', $year, $count);
            $count++;
        } while (static::withTrashed()->where('code', $code)->exists());

        return $code;
    }
}
