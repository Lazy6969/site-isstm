<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryCategory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'slug',
        'name_fr',
        'icon',
        'display_order',
    ];
}
