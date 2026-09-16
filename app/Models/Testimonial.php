<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'author_name',
        'program',
        'image_path',
        'quote_fr',
        'quote_en',
        'quote_mg',
        'display_order',
    ];
}
