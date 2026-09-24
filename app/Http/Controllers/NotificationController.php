<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate(20)
            ->withQueryString();

        $presented = $this->present($notifications->getCollection());

        $groups = $presented->groupBy(function (array $notification) {
            $date = $notification['created_at'];

            return match (true) {
                $date->isToday() => 'Aujourd\'hui',
                $date->isYesterday() => 'Hier',
                $date->isAfter(now()->subWeek()) => 'Cette semaine',
                default => 'Plus ancien',
            };
        });

        return Inertia::render('Notifications/Index', [
            'groups' => $groups,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    public function recent(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()->latest()->limit(10)->get();

        return response()->json([
            'notifications' => $this->present($notifications),
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markRead(Request $request, DatabaseNotification $notification): RedirectResponse|JsonResponse
    {
        abort_unless($notification->notifiable_id === $request->user()->id, 403);

        $notification->markAsRead();

        return $request->wantsJson() ? response()->json(['status' => 'ok']) : back();
    }

    public function markAllRead(Request $request): RedirectResponse|JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return $request->wantsJson() ? response()->json(['status' => 'ok']) : back();
    }

    public function destroy(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        abort_unless($notification->notifiable_id === $request->user()->id, 403);

        $notification->delete();

        return back();
    }

    public function destroySelected(Request $request): RedirectResponse|JsonResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string'],
        ])['ids'];

        $request->user()->notifications()->whereIn('id', $ids)->delete();

        return $request->wantsJson() ? response()->json(['status' => 'ok']) : back();
    }

    public function destroyAll(Request $request): RedirectResponse|JsonResponse
    {
        $request->user()->notifications()->delete();

        return $request->wantsJson() ? response()->json(['status' => 'ok']) : back();
    }

    /**
     * @param  Collection<int, DatabaseNotification>  $notifications
     * @return Collection<int, array<string, mixed>>
     */
    private function present(Collection $notifications): Collection
    {
        $actorIds = $notifications->pluck('data.actor_id')->filter()->unique();
        $postIds = $notifications->pluck('data.post_id')->filter()->unique();

        $actors = User::query()->whereIn('id', $actorIds)->get()->keyBy('id');
        $posts = Post::query()->whereIn('id', $postIds)->get()->keyBy('id');

        return $notifications->map(function (DatabaseNotification $notification) use ($actors, $posts) {
            $actor = $actors->get($notification->data['actor_id'] ?? null);
            $post = $posts->get($notification->data['post_id'] ?? null);

            return [
                'id' => $notification->id,
                'type' => $notification->data['type'] ?? null,
                'read' => $notification->read_at !== null,
                'created_at' => $notification->created_at,
                'actor' => $actor ? ['id' => $actor->id, 'name' => $actor->name, 'avatar_path' => $actor->avatar_path] : null,
                'post_id' => $post?->id,
                'post_excerpt' => $post ? str($post->body ?? '')->limit(80)->toString() : null,
                'comment_id' => $notification->data['comment_id'] ?? null,
                'friend_request_id' => $notification->data['friend_request_id'] ?? null,
                'conversation_id' => $notification->data['conversation_id'] ?? null,
            ];
        });
    }
}
