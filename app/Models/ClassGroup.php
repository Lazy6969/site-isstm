<?php

namespace App\Models;

use App\ClassGroupType;
use Database\Factories\ClassGroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassGroup extends Model
{
    /** @use HasFactory<ClassGroupFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'annee',
        'filiere_id',
        'niveau',
        'join_code',
        'teacher_id',
    ];

    protected function casts(): array
    {
        return [
            'type' => ClassGroupType::class,
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(ClassGroupMember::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ClassGroupMessage::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(ClassGroupAnnouncement::class);
    }

    public function presenceSessions(): HasMany
    {
        return $this->hasMany(ClassGroupPresenceSession::class);
    }

    public function memberFor(User $user): ?ClassGroupMember
    {
        return $this->members->firstWhere('user_id', $user->id);
    }
}
