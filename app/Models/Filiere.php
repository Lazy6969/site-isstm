<?php

namespace App\Models;

use Database\Factories\FiliereFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    /** @use HasFactory<FiliereFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'mention',
        'niveaux',
        'slug',
        'nom_fr',
        'nom_en',
        'nom_mg',
        'description_fr',
        'description_en',
        'description_mg',
        'debouches_fr',
        'debouches_en',
        'debouches_mg',
        'historique_fr',
        'historique_en',
        'historique_mg',
        'avantages_fr',
        'avantages_en',
        'avantages_mg',
        'image_path',
        'display_order',
    ];
}
