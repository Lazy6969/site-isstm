<?php

namespace App\Models;

use Database\Factories\HeroSlideFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HeroSlide extends Model
{
    /** @use HasFactory<HeroSlideFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'image_path',
        'media_type',
        'display_order',
    ];
}
