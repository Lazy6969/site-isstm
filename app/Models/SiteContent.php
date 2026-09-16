<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = [
        'content_key',
        'content_value_fr',
        'content_value_en',
        'content_value_mg',
    ];
}
