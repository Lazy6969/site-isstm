<?php

namespace App\Models;

use Database\Factories\TestimonialFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    /** @use HasFactory<TestimonialFactory> */
    use HasFactory;

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
