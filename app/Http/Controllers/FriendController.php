<?php

namespace App\Http\Controllers;

use App\FriendRequestStatus;
use App\Models\FriendRequest;
use App\Models\User;
use App\Notifications\FriendRequestAccepted;
use App\Notifications\FriendRequestReceived;
use App\Role;
use App\Services\FriendSuggestionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FriendController extends Controller
{
    public function __construct(private readonly FriendSuggestionService $suggestions) {}

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
                ->map(fn (User $candidate) => $this->suggestions->present($candidate, $user));
        }

        return Inertia::render('Amis/Index', [
            'query' => $query ?? '',
            'searchResults' => $searchResults,
            'friends' => $user->friends()->map(fn (User $friend) => $this->suggestions->present($friend, $user)),
            'received' => $user->receivedFriendRequests()
                ->with('sender')
                ->where('status', FriendRequestStatus::Pending)
                ->latest()
                ->get()
                ->map(fn (FriendRequest $friendRequest) => [
                    'id' => $friendRequest->id,
                    'user' => $this->suggestions->present($friendRequest->sender, $user),
                ]),
            'sent' => $user->sentFriendRequests()
                ->with('recipient')
                ->where('status', FriendRequestStatus::Pending)
                ->latest()
                ->get()
                ->map(fn (FriendRequest $friendRequest) => [
                    'id' => $friendRequest->id,
                    'user' => $this->suggestions->present($friendRequest->recipient, $user),
                ]),
            'suggestions' => $this->suggestions->forUser($user)->map(fn (User $candidate) => $this->suggestions->present($candidate, $user)),
        ]);
    }

    public function store(Request $request, User $recipient): RedirectResponse
    {
        $sender = $request->user();

        abort_if($sender->id === $recipient->id, 422, 'Vous ne pouvez pas vous ajouter vous-même.');
        abort_unless($recipient->isCommunityMember(), 422);
        abort_if($sender->friendshipWith($recipient) !== null, 409, 'Une relation existe déjà avec cet utilisateur.');

        $friendRequest = FriendRequest::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'status' => FriendRequestStatus::Pending,
        ]);

        $recipient->notify(new FriendRequestReceived($friendRequest));

        return back()->with('status', "Demande d'ami envoyée à {$recipient->name}.");
    }

    public function accept(Request $request, FriendRequest $friendRequest): RedirectResponse
    {
        abort_unless($friendRequest->recipient_id === $request->user()->id, 403);
        abort_unless($friendRequest->status === FriendRequestStatus::Pending, 409);

        $friendRequest->update(['status' => FriendRequestStatus::Accepted]);

        $friendRequest->sender->notify(new FriendRequestAccepted($friendRequest));

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
}
