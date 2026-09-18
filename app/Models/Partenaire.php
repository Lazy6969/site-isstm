<?php

namespace App\Models;

use Database\Factories\PartenaireFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partenaire extends Model
{
    /** @use HasFactory<PartenaireFactory> */
    use HasFactory;

    protected $fillable = [
        'nom',
        'logo_path',
        'site_url',
        'display_order',
    ];
}
