<?php

namespace App\Models;

use Database\Factories\MaterielEmpruntFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterielEmprunt extends Model
{
    /** @use HasFactory<MaterielEmpruntFactory> */
    use HasFactory;

    /**
     * @var array<string, string>
     */
    public const EMPRUNTEUR_TYPES = [
        'etudiant' => 'Étudiant',
        'enseignant' => 'Enseignant',
        'personnel' => 'Personnel administratif',
        'externe' => 'Externe',
    ];

    /**
     * @var array<string, string>
     */
    public const ETATS_RETOUR = [
        'bon' => 'Bon état',
        'usure' => 'Usure normale',
        'endommage' => 'Endommagé',
    ];

    protected $fillable = [
        'materiel_id',
        'emprunteur_nom',
        'emprunteur_type',
        'emprunteur_reference',
        'emprunteur_contact',
        'motif',
        'date_sortie',
        'date_retour_prevue',
        'date_retour_effective',
        'etat_au_retour',
        'note_retour',
        'prete_par',
        'recu_par',
    ];

    protected function casts(): array
    {
        return [
            'date_sortie' => 'date',
            'date_retour_prevue' => 'date',
            'date_retour_effective' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Materiel, $this>
     */
    public function materiel(): BelongsTo
    {
        return $this->belongsTo(Materiel::class)->withTrashed();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function preteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prete_par');
    }

    /**
     * @param  Builder<MaterielEmprunt>  $query
     */
    public function scopeEnCours(Builder $query): void
    {
        $query->whereNull('date_retour_effective');
    }

    /**
     * @param  Builder<MaterielEmprunt>  $query
     */
    public function scopeEnRetard(Builder $query): void
    {
        $query->whereNull('date_retour_effective')->whereDate('date_retour_prevue', '<', today());
    }

    public function isEnRetard(): bool
    {
        return $this->date_retour_effective === null && $this->date_retour_prevue->lt(today());
    }
}
