<?php

namespace App\Models\Bibliotheque;

use App\BibliothequeFileType;
use App\CanevasNiveau;
use Database\Factories\Bibliotheque\CanevasFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Canevas extends Model
{
    /** @use HasFactory<CanevasFactory> */
    use HasFactory;

    protected $connection = 'bibliotheque';

    protected $table = 'canevas';

    protected $fillable = [
        'titre',
        'niveau',
        'annee_id',
        'type_fichier',
        'chemin_fichier',
    ];

    protected function casts(): array
    {
        return [
            'niveau' => CanevasNiveau::class,
            'type_fichier' => BibliothequeFileType::class,
        ];
    }

    public function annee(): BelongsTo
    {
        return $this->belongsTo(AnneeUniversitaire::class, 'annee_id');
    }
}
