<?php

namespace App\Services;

use App\FriendRequestStatus;
use App\Models\Candidat;
use App\Models\FriendRequest;
use App\Models\User;
use App\PreinscriptionStatus;
use App\Role;
use Illuminate\Database\Eloquent\Collection;

/**
 * "People you may know" — shared by the Amis hub (full list) and the
 * Communauté feed's sidebar widget (a short preview), so both offer the
 * same same-filière-first, random-backfill suggestions instead of the
 * sidebar growing its own thinner logic.
 */
class FriendSuggestionService
{
    /**
     * @return Collection<int, User>
     */
    public function forUser(User $user, int $limit = 8): Collection
    {
        $relatedIds = FriendRequest::query()
            ->where('sender_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->get()
            ->flatMap(fn (FriendRequest $friendRequest) => [$friendRequest->sender_id, $friendRequest->recipient_id])
            ->push($user->id)
            ->unique();

        $filiereId = $user->approvedCandidat()?->filiere_id;

        $suggestions = new Collection;

        if ($filiereId !== null) {
            $sameFiliereUserIds = Candidat::query()
                ->where('filiere_id', $filiereId)
                ->where('status', PreinscriptionStatus::Accepte)
                ->whereNotNull('user_id')
                ->pluck('user_id');

            $suggestions = User::query()
                ->whereIn('role', [Role::Admin, Role::Enseignant, Role::Etudiant])
                ->whereIn('id', $sameFiliereUserIds)
                ->whereNotIn('id', $relatedIds)
                ->inRandomOrder()
                ->limit($limit)
                ->get();
        }

        $remaining = $limit - $suggestions->count();
        if ($remaining > 0) {
            $more = User::query()
                ->whereIn('role', [Role::Admin, Role::Enseignant, Role::Etudiant])
                ->whereNotIn('id', $relatedIds->merge($suggestions->pluck('id')))
                ->inRandomOrder()
                ->limit($remaining)
                ->get();

            $suggestions = $suggestions->merge($more);
        }

        return $suggestions;
    }

    /**
     * @return array<string, mixed>
     */
    public function present(User $candidate, User $viewer): array
    {
        $preinscription = $candidate->role === Role::Etudiant ? $candidate->approvedCandidat()?->load('filiere') : null;
        $friendRequest = $viewer->friendshipWith($candidate);

        return [
            'id' => $candidate->id,
            'name' => $candidate->name,
            'avatar_path' => $candidate->avatar_path,
            'role' => $candidate->role->value,
            'role_label' => $candidate->role->label(),
            'filiere' => $preinscription?->filiere?->nom_fr,
            'status' => $this->relationshipStatus($friendRequest, $viewer),
            'friend_request_id' => $friendRequest?->id,
            'online' => $candidate->isOnline(),
        ];
    }

    private function relationshipStatus(?FriendRequest $friendRequest, User $viewer): string
    {
        if ($friendRequest === null || $friendRequest->status === FriendRequestStatus::Declined) {
            return 'aucune';
        }

        if ($friendRequest->status === FriendRequestStatus::Accepted) {
            return 'amis';
        }

        return $friendRequest->sender_id === $viewer->id ? 'envoyee' : 'recue';
    }
}
