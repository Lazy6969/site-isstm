<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\MediaType;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\Notifications\NewPostPublished;
use App\PostType;
use App\Role;
use App\Services\ConversationListBuilder;
use App\Services\FriendSuggestionService;
use App\Services\PostPresenter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        private readonly PostPresenter $presenter,
        private readonly FriendSuggestionService $suggestions,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $posts = $this->visiblePosts(Post::query(), $user)
            ->with($this->presenter->eagerLoad())
            ->withCount('viewedBy')
            ->orderByRaw('pinned_at is null')
            ->orderByDesc('pinned_at')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => $this->presenter->present($post, $user));

        return Inertia::render('Communaute/Index', [
            'posts' => $posts,
            'canPublish' => $user->canInCommunity('community.post'),
            'postTypes' => array_map(fn (PostType $type) => ['value' => $type->value, 'label' => $type->label()], PostType::cases()),
            'friends' => $user->friends()->map(fn (User $friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'avatar_path' => $friend->avatar_path,
                'online' => $friend->isVisiblyOnline(),
            ])->values(),
            // The left sidebar's own mini profile card — same shape as a friend
            // suggestion (see FriendSuggestionService::present), just presented
            // about the viewer instead of a candidate to befriend.
            'profile' => fn () => $this->suggestions->present($user, $user),
            'conversations' => fn () => app(ConversationListBuilder::class)->forUser($user)->take(10)->values(),
            'suggestions' => fn () => $this->suggestions->forUser($user, 5)->map(fn (User $candidate) => $this->suggestions->present($candidate, $user)),
        ]);
    }

    /**
     * Vertical-scroll, video-only feed drawn from the same posts the viewer
     * could otherwise see in their feed — not a separate content type, just
     * a different lens onto post_media rows already uploaded with the
     * community feed's own composer.
     */
    public function reels(Request $request): Response
    {
        $user = $request->user();

        $videos = PostMedia::query()
            ->where('type', MediaType::Video)
            ->whereHas('post', fn (Builder $query) => $this->visiblePosts($query, $user))
            ->with(['post.user:id,name,avatar_path'])
            ->latest('id')
            ->paginate(6)
            ->withQueryString();

        $videos->getCollection()->transform(fn (PostMedia $media) => [
            'id' => $media->id,
            'path' => $media->path,
            'post' => [
                'id' => $media->post->id,
                'body' => $media->post->body,
                'created_at' => $media->post->created_at,
                'user' => [
                    'id' => $media->post->user->id,
                    'name' => $media->post->user->name,
                    'avatar_path' => $media->post->user->avatar_path,
                ],
            ],
        ]);

        return Inertia::render('Communaute/Reels', [
            'videos' => $videos,
        ]);
    }

    /**
     * "Souvenirs" — the viewer's own posts published on this same day in a
     * previous year, fetched on demand (like /stories) rather than loaded
     * on every feed visit, since most days turn up nothing.
     */
    public function memories(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now();

        $posts = Post::query()
            ->where('user_id', $user->id)
            ->whereNull('archived_at')
            ->whereYear('created_at', '<', $today->year)
            ->whereMonth('created_at', $today->month)
            ->whereDay('created_at', $today->day)
            ->with('media')
            ->latest()
            ->get()
            ->map(fn (Post $post) => [
                'id' => $post->id,
                'body' => $post->body,
                'created_at' => $post->created_at,
                'years_ago' => $today->year - $post->created_at->year,
                'media' => $post->media->map(fn (PostMedia $media) => [
                    'id' => $media->id,
                    'path' => $media->path,
                    'type' => $media->type->value,
                ]),
            ]);

        return response()->json(['memories' => $posts]);
    }

    /**
     * The community feed's visibility rule, shared by index() and reels():
     * public posts, the viewer's own, and friends-only posts from a friend.
     */
    private function visiblePosts(Builder $query, User $user): Builder
    {
        $friendIds = $user->friends()->pluck('id');

        return $query
            ->whereDoesntHave('hiddenBy', fn ($hidden) => $hidden->where('users.id', $user->id))
            ->whereNull('archived_at')
            ->where(fn ($visibility) => $visibility
                ->where('visibility', 'public')
                ->orWhere('user_id', $user->id)
                ->orWhere(fn ($friendsOnly) => $friendsOnly->where('visibility', 'amis')->whereIn('user_id', $friendIds)));
    }

    public function show(Request $request, Post $post): Response
    {
        $post->load($this->presenter->eagerLoad());
        $post->viewedBy()->syncWithoutDetaching([$request->user()->id]);
        $post->loadCount('viewedBy');

        return Inertia::render('Communaute/Show', [
            'post' => $this->presenter->present($post, $request->user()),
        ]);
    }

    public function saved(Request $request): Response
    {
        $user = $request->user();

        $posts = $user->savedPosts()
            ->with($this->presenter->eagerLoad())
            ->withCount('viewedBy')
            ->latest('post_saves.created_at')
            ->paginate(10)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => $this->presenter->present($post, $user));

        return Inertia::render('Communaute/Enregistres', [
            'posts' => $posts,
        ]);
    }

    public function archives(Request $request): Response
    {
        $user = $request->user();

        $posts = Post::query()
            ->where('user_id', $user->id)
            ->whereNotNull('archived_at')
            ->with($this->presenter->eagerLoad())
            ->withCount('viewedBy')
            ->latest('archived_at')
            ->paginate(10)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => $this->presenter->present($post, $user));

        return Inertia::render('Communaute/Archives', [
            'posts' => $posts,
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $user = $request->user();

        $post = Post::create([
            'user_id' => $user->id,
            'shared_post_id' => $request->validated('shared_post_id'),
            'type' => $request->validated('type'),
            'body' => $request->validated('body'),
            'visibility' => $request->validated('visibility') ?? 'public',
            'mood' => $request->validated('mood'),
            'location' => $request->validated('location'),
        ]);

        $friendIds = $user->friends()->pluck('id');
        $post->taggedUsers()->sync(collect($request->validated('tagged_user_ids', []))->intersect($friendIds));

        foreach ($request->file('media', []) as $order => $file) {
            $mediaType = MediaType::fromMimeType($file->getMimeType());
            if ($mediaType === null) {
                continue;
            }

            PostMedia::create([
                'post_id' => $post->id,
                'path' => $file->store('communaute', 'public'),
                'type' => $mediaType,
                'display_order' => $order,
            ]);
        }

        $recipients = User::query()
            ->whereIn('role', [Role::Admin, Role::Enseignant, Role::Etudiant])
            ->where('id', '!=', $post->user_id)
            ->get();

        Notification::send($recipients, new NewPostPublished($post));

        return back()->with('status', $post->shared_post_id ? 'Publication partagée.' : 'Publication créée.');
    }

    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $post->update([
            'body' => $request->validated('body'),
            'edited_at' => now(),
        ]);

        return back()->with('status', 'Publication modifiée.');
    }

    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isAdministrator() || $post->user_id === $user->id, 403);

        $post->delete();

        return back()->with('status', 'Publication supprimée.');
    }
}
