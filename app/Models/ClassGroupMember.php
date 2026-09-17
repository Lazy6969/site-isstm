<?php

namespace App\Models;

use App\GroupMemberRole;
use Database\Factories\ClassGroupMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassGroupMember extends Model
{
    /** @use HasFactory<ClassGroupMemberFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'class_group_id',
        'user_id',
        'role_in_group',
        'is_banned',
        'is_delegate',
        'joined_at',
        'last_read_at',
    ];

    protected function casts(): array
    {
        return [
            'role_in_group' => GroupMemberRole::class,
            'is_banned' => 'boolean',
            'is_delegate' => 'boolean',
            'joined_at' => 'datetime',
            'last_read_at' => 'datetime',
        ];
    }

    public function classGroup(): BelongsTo
    {
        return $this->belongsTo(ClassGroup::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function canModerate(): bool
    {
        return $this->role_in_group === GroupMemberRole::Enseignant;
    }

    public function canDownloadPresence(): bool
    {
        return $this->role_in_group === GroupMemberRole::Enseignant || $this->is_delegate;
    }
}
