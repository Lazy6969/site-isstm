<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
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
        'image_path',
        'display_order',
    ];
}
