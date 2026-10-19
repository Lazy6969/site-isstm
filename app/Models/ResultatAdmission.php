<?php

namespace App\Models;

use Database\Factories\ResultatAdmissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One line of the "Résultats" page under Établissement — an admin-published
 * list of admitted candidates, imported from an Excel file (see
 * Admin\ResultatAdmissionController::import() and XlsxReader) or entered by
 * hand. Deliberately standalone rather than linked to `candidats` /
 * `preinscriptions`: this publishes a selection the scolarité already made
 * outside the system (an entrance-exam jury's list, say), not the online
 * dossier workflow — importing here never touches an existing account or
 * triggers the préinscription-acceptance e-mail.
 */
class ResultatAdmission extends Model
{
    /** @use HasFactory<ResultatAdmissionFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'nom',
        'prenoms',
        'niveau',
        'filiere_id',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    /** Null when active/public; set once this résultat is filed under an
     * ArchiveDossier (see that model's docblock). */
    public function archiveDossier(): BelongsTo
    {
        return $this->belongsTo(ArchiveDossier::class);
    }
}
