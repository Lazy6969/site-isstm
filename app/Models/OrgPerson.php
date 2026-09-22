<?php

namespace App\Models;

use Database\Factories\OrgPersonFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrgPerson extends Model
{
    /** @use HasFactory<OrgPersonFactory> */
    use HasFactory;

    protected $fillable = [
        'title_key',
        'name',
        'photo_path',
        'sort_order',
    ];
}
