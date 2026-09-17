<?php

namespace App\Models\Bibliotheque;

use Database\Factories\Bibliotheque\AnneeUniversitaireFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnneeUniversitaire extends Model
{
    /** @use HasFactory<AnneeUniversitaireFactory> */
    use HasFactory;

    protected $connection = 'bibliotheque';

    protected $table = 'annees_universitaires';

    protected $fillable = [
        'libelle',
    ];
}
