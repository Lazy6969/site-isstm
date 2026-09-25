<?php

namespace App\Models;

use App\ClassGroupType;
use App\Role;
use Database\Factories\ClassGroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

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
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => ClassGroupType::class,
            'archived_at' => 'datetime',
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

    /**
     * Attendance-taking only makes sense for an official class group run by
     * a teacher — a student's own casual study/club group has no roster to
     * track, so it never exposes the presence sheet regardless of who
     * happens to hold the "enseignant" role within that particular group.
     */
    public function hasPresenceFeature(): bool
    {
        return $this->teacher->role !== Role::Etudiant;
    }

    /**
     * Unread messages + announcements for $user since $lastReadAt — shared by
     * the dedicated group page and the unified conversation list on /messages.
     */
    public function unreadCountFor(User $user, ?Carbon $lastReadAt): int
    {
        $messages = ClassGroupMessage::query()
            ->where('class_group_id', $this->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('deleted_for_everyone_at')
            ->when($lastReadAt, fn ($query) => $query->where('created_at', '>', $lastReadAt))
            ->count();

        $announcements = ClassGroupAnnouncement::query()
            ->where('class_group_id', $this->id)
            ->where('teacher_id', '!=', $user->id)
            ->when($lastReadAt, fn ($query) => $query->where('created_at', '>', $lastReadAt))
            ->count();

        return $messages + $announcements;
    }
}
