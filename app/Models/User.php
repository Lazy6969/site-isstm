<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\FriendRequestStatus;
use App\PreinscriptionStatus;
use App\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable([
    'name',
    'email',
    'password',
    'role',
    'phone',
    'bio',
    'birth_date',
    'city',
    'interests',
    'facebook_url',
    'linkedin_url',
    'personal_website',
    'avatar_path',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
            'is_messagerie' => 'boolean',
            'birth_date' => 'date',
            'last_activity' => 'datetime',
        ];
    }

    public function isOnline(): bool
    {
        return $this->last_activity !== null && $this->last_activity->gt(now()->subSeconds(25));
    }

    /**
     * Checks the legacy `role` enum column. Named distinctly from Spatie's
     * HasRoles::hasRole() (string/BackedEnum role names) — Spatie's own internals
     * call $user->hasRole() with incompatible arguments, so the two can't share a name.
     * Use hasAnyRole()/can() for Spatie permission checks.
     */
    public function hasLegacyRole(Role ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function etudiant(): HasOne
    {
        return $this->hasOne(Etudiant::class);
    }

    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'sender_id');
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'recipient_id');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function classGroupMemberships(): HasMany
    {
        return $this->hasMany(ClassGroupMember::class);
    }

    public function hiddenStaffMessages(): BelongsToMany
    {
        return $this->belongsToMany(StaffMessage::class, 'staff_message_hides', 'user_id', 'message_id');
    }

    /**
     * @return Collection<int, User>
     */
    public function friends(): Collection
    {
        return FriendRequest::query()
            ->where('status', FriendRequestStatus::Accepted)
            ->where(fn ($query) => $query->where('sender_id', $this->id)->orWhere('recipient_id', $this->id))
            ->with(['sender', 'recipient'])
            ->get()
            ->map(fn (FriendRequest $request) => $request->sender_id === $this->id ? $request->recipient : $request->sender)
            ->sortBy('name')
            ->values();
    }

    public function isFriendsWith(User $other): bool
    {
        return $this->friendshipWith($other)?->status === FriendRequestStatus::Accepted;
    }

    public function friendshipWith(User $other): ?FriendRequest
    {
        return FriendRequest::query()
            ->where(fn ($query) => $query->where('sender_id', $this->id)->where('recipient_id', $other->id))
            ->orWhere(fn ($query) => $query->where('sender_id', $other->id)->where('recipient_id', $this->id))
            ->first();
    }

    /**
     * The user's filière, resolved through their latest approved préinscription (there is no
     * direct filière column on users — see amis_get_filiere() in the legacy reference).
     */
    public function approvedPreinscription(): ?Preinscription
    {
        return Preinscription::query()
            ->where('user_id', $this->id)
            ->where('status', PreinscriptionStatus::Approuve)
            ->latest('created_at')
            ->first();
    }
}
