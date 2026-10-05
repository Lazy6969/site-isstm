<?php

namespace App\Models;

use Database\Factories\CampusBlocFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CampusBloc extends Model
{
    /** @use HasFactory<CampusBlocFactory> */
    use HasFactory;

    use SoftDeletes;

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
