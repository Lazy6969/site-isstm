<?php

namespace App\Models;

use Database\Factories\ArchiveDossierFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A named, dated batch of archived résultats — created when an admin clicks
 * "Archiver" on the active Résultats list (see
 * Admin\ArchiveDossierController::store()). Every ResultatAdmission that
 * belongs to one is, by definition, archived: archive_dossier_id null means
 * active/public, set means archived under this dossier. Deleting or
 * restoring a dossier acts on every résultat filed under it at once.
 */
class ArchiveDossier extends Model
{
    /** @use HasFactory<ArchiveDossierFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'nom',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function resultats(): HasMany
    {
        return $this->hasMany(ResultatAdmission::class);
    }
}
