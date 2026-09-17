<?php

namespace App\Models;

use App\AnnouncementType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassGroupAnnouncement extends Model
{
    protected $fillable = [
        'class_group_id',
        'teacher_id',
        'type',
        'title',
        'description',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'type' => AnnouncementType::class,
            'due_date' => 'date',
        ];
    }

    public function classGroup(): BelongsTo
    {
        return $this->belongsTo(ClassGroup::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
