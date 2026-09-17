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
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

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
    use HasFactory, Notifiable;

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
        ];
    }

    public function hasRole(Role ...$roles): bool
    {
        return in_array($this->role, $roles, true);
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
