<?php

namespace App\Models;

use Database\Factories\CampusBlocFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusBloc extends Model
{
    /** @use HasFactory<CampusBlocFactory> */
    use HasFactory;

    protected $fillable = [
        'bloc_key',
        'nom',
        'signification',
        'fondation',
        'fondateurs',
        'slogan',
        'objectifs',
        'activites',
        'danse',
        'mampiavaka',
        'images',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
        ];
    }
}
