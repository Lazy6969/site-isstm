<?php

namespace App\Models;

use App\TeacherCategory;
use Database\Factories\TeacherFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    /** @use HasFactory<TeacherFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'name',
        'category',
        'specialty_fr',
        'specialty_en',
        'specialty_mg',
        'description_fr',
        'description_en',
        'description_mg',
        'photo_path',
        'email',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'category' => TeacherCategory::class,
        ];
    }
}
