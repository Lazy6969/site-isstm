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
use App\Services\PostPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(private readonly PostPresenter $presenter) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $friendIds = $user->friends()->pluck('id');

        $posts = Post::query()
            ->whereDoesntHave('hiddenBy', fn ($query) => $query->where('users.id', $user->id))
            ->whereNull('archived_at')
            ->where(fn ($query) => $query
                ->where('visibility', 'public')
                ->orWhere('user_id', $user->id)
                ->orWhere(fn ($friendsOnly) => $friendsOnly->where('visibility', 'amis')->whereIn('user_id', $friendIds)))
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
            'canPublish' => $user->hasLegacyRole(Role::Etudiant, Role::Admin, Role::Enseignant),
            'postTypes' => array_map(fn (PostType $type) => ['value' => $type->value, 'label' => $type->label()], PostType::cases()),
            'friends' => $user->friends()->map(fn (User $friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'avatar_path' => $friend->avatar_path,
            ])->values(),
            'conversations' => fn () => app(ConversationListBuilder::class)->forUser($user)->take(10)->values(),
        ]);
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
        abort_unless($user->hasLegacyRole(Role::Admin) || $post->user_id === $user->id, 403);

        $post->delete();

        return back()->with('status', 'Publication supprimée.');
    }
}
