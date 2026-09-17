<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassGroupPresenceSession extends Model
{
    protected $fillable = [
        'class_group_id',
        'session_date',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'date:Y-m-d',
        ];
    }

    public function classGroup(): BelongsTo
    {
        return $this->belongsTo(ClassGroup::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function marks(): HasMany
    {
        return $this->hasMany(ClassGroupPresenceMark::class, 'session_id');
    }
}
