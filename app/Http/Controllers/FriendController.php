<?php

namespace App\Http\Controllers;

use App\FriendRequestStatus;
use App\Models\FriendRequest;
use App\Models\Preinscription;
use App\Models\User;
use App\PreinscriptionStatus;
use App\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FriendController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $searchResults = collect();
        if ($query = trim((string) $request->string('q'))) {
            $searchResults = User::query()
                ->whereIn('role', [Role::Admin, Role::Enseignant, Role::Etudiant])
                ->where('id', '!=', $user->id)
                ->where(fn (Builder $builder) => $builder
                    ->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%"))
                ->orderBy('name')
                ->limit(20)
                ->get()
                ->map(fn (User $candidate) => $this->presentUser($candidate, $user));
        }

        return Inertia::render('Amis/Index', [
            'query' => $query ?? '',
            'searchResults' => $searchResults,
            'friends' => $user->friends()->map(fn (User $friend) => $this->presentUser($friend, $user)),
            'received' => $user->receivedFriendRequests()
                ->with('sender')
                ->where('status', FriendRequestStatus::Pending)
                ->latest()
                ->get()
                ->map(fn (FriendRequest $friendRequest) => [
                    'id' => $friendRequest->id,
                    'user' => $this->presentUser($friendRequest->sender, $user),
                ]),
            'sent' => $user->sentFriendRequests()
                ->with('recipient')
                ->where('status', FriendRequestStatus::Pending)
                ->latest()
                ->get()
                ->map(fn (FriendRequest $friendRequest) => [
                    'id' => $friendRequest->id,
                    'user' => $this->presentUser($friendRequest->recipient, $user),
                ]),
            'suggestions' => $this->suggestionsFor($user)->map(fn (User $candidate) => $this->presentUser($candidate, $user)),
        ]);
    }

    public function store(Request $request, User $recipient): RedirectResponse
    {
        $sender = $request->user();

        abort_if($sender->id === $recipient->id, 422, 'Vous ne pouvez pas vous ajouter vous-même.');
        abort_unless($recipient->hasLegacyRole(Role::Admin, Role::Enseignant, Role::Etudiant), 422);
        abort_if($sender->friendshipWith($recipient) !== null, 409, 'Une relation existe déjà avec cet utilisateur.');

        FriendRequest::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'status' => FriendRequestStatus::Pending,
        ]);

        return back()->with('status', "Demande d'ami envoyée à {$recipient->name}.");
    }

    public function accept(Request $request, FriendRequest $friendRequest): RedirectResponse
    {
        abort_unless($friendRequest->recipient_id === $request->user()->id, 403);
        abort_unless($friendRequest->status === FriendRequestStatus::Pending, 409);

        $friendRequest->update(['status' => FriendRequestStatus::Accepted]);

        return back()->with('status', "Vous êtes maintenant ami avec {$friendRequest->sender->name}.");
    }

    public function decline(Request $request, FriendRequest $friendRequest): RedirectResponse
    {
        abort_unless($friendRequest->recipient_id === $request->user()->id, 403);
        abort_unless($friendRequest->status === FriendRequestStatus::Pending, 409);

        $friendRequest->update(['status' => FriendRequestStatus::Declined]);

        return back()->with('status', 'Demande refusée.');
    }

    public function destroy(Request $request, FriendRequest $friendRequest): RedirectResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->id, [$friendRequest->sender_id, $friendRequest->recipient_id], true), 403);

        $friendRequest->delete();

        return back()->with('status', 'Relation supprimée.');
    }

    /**
     * @return array<string, mixed>
     */
    private function presentUser(User $candidate, User $viewer): array
    {
        $preinscription = $candidate->role === Role::Etudiant ? $candidate->approvedPreinscription()?->load('filiere') : null;
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

    /**
     * @return Collection<int, User>
     */
    private function suggestionsFor(User $user, int $limit = 8): Collection
    {
        $relatedIds = FriendRequest::query()
            ->where('sender_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->get()
            ->flatMap(fn (FriendRequest $friendRequest) => [$friendRequest->sender_id, $friendRequest->recipient_id])
            ->push($user->id)
            ->unique();

        $filiereId = $user->approvedPreinscription()?->filiere_id;

        $suggestions = new Collection;

        if ($filiereId !== null) {
            $sameFiliereUserIds = Preinscription::query()
                ->where('filiere_id', $filiereId)
                ->where('status', PreinscriptionStatus::Approuve)
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
}
