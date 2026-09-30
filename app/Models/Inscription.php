<?php

namespace App\Models;

use App\StatutInscription;
use App\TypeInscription;
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
        'type',
        'filiere_id',
        'niveau_souhaite',
        'annee',
        'numero',
        'numero_dossier',
        'statut',
        'date_inscription',
        'releve_notes_path',
        'piece_supplementaire_path',
        'commentaire_correction',
        'motif_refus',
        'submitted_at',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => TypeInscription::class,
            'statut' => StatutInscription::class,
            'date_inscription' => 'date',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
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

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    /**
     * REI-{année}-{séquence} pour une réinscription, RED-{année}-{séquence} pour
     * un redoublement — même principe que Candidat::generateNumeroDossier().
     */
    public static function generateNumeroDossier(TypeInscription $type): string
    {
        $prefix = $type === TypeInscription::Redoublement ? 'RED' : 'REI';
        $year = now()->year;
        $count = static::query()->where('numero_dossier', 'like', "{$prefix}-{$year}-%")->count() + 1;

        return sprintf('%s-%d-%05d', $prefix, $year, $count);
    }
}
