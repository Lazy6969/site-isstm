<?php

namespace App\Models;

use Database\Factories\ClasseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classe extends Model
{
    /** @use HasFactory<ClasseFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'nom',
        'filiere_id',
        'niveau',
        'annee',
        'effectif_max',
    ];

    /**
     * The academic year new students are placed in: the one the scolarité set
     * for the online dossiers, or the current calendar year when none is set.
     */
    public static function currentYear(): string
    {
        return SiteContent::where('content_key', 'inscription_annee_universitaire')->value('content_value_fr') ?? (string) now()->year;
    }

    /**
     * The niveau (class) for a filière and level in a given year. Created the
     * first time someone is placed in it, so approving a dossier never has to
     * wait for the scolarité to set the niveau up by hand; an existing one —
     * including one that was soft-deleted — is reused rather than duplicated.
     */
    public static function forNiveau(int $filiereId, string $niveau, ?string $annee = null): self
    {
        $annee ??= self::currentYear();

        $existing = self::withTrashed()
            ->where('filiere_id', $filiereId)
            ->where('niveau', $niveau)
            ->where('annee', $annee)
            ->orderBy('id')
            ->first();

        if ($existing !== null) {
            if ($existing->trashed()) {
                $existing->restore();
            }

            return $existing;
        }

        $filiere = Filiere::findOrFail($filiereId);

        return self::create([
            'nom' => "{$niveau} · ".($filiere->code ?: $filiere->nom_fr),
            'filiere_id' => $filiereId,
            'niveau' => $niveau,
            'annee' => $annee,
        ]);
    }

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
