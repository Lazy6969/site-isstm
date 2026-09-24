<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\MediaType;
use App\Models\Comment;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Reaction;
use App\Models\User;
use App\Notifications\NewPostPublished;
use App\PostType;
use App\ReactionType;
use App\Role;
use App\Services\ConversationListBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $posts = Post::query()
            ->whereDoesntHave('hiddenBy', fn ($query) => $query->where('users.id', $user->id))
            ->whereNull('archived_at')
            ->with($this->eagerLoad())
            ->orderByRaw('pinned_at is null')
            ->orderByDesc('pinned_at')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => $this->presentPost($post, $user));

        return Inertia::render('Communaute/Index', [
            'posts' => $posts,
            'canPublish' => $user->hasLegacyRole(Role::Admin, Role::Enseignant),
            'postTypes' => array_map(fn (PostType $type) => ['value' => $type->value, 'label' => $type->label()], PostType::cases()),
            'conversations' => fn () => app(ConversationListBuilder::class)->forUser($user)->take(8)->values(),
        ]);
    }

    public function show(Request $request, Post $post): Response
    {
        $post->load($this->eagerLoad());

        return Inertia::render('Communaute/Show', [
            'post' => $this->presentPost($post, $request->user()),
        ]);
    }

    public function saved(Request $request): Response
    {
        $user = $request->user();

        $posts = $user->savedPosts()
            ->with($this->eagerLoad())
            ->latest('post_saves.created_at')
            ->paginate(10)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => $this->presentPost($post, $user));

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
            ->with($this->eagerLoad())
            ->latest('archived_at')
            ->paginate(10)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => $this->presentPost($post, $user));

        return Inertia::render('Communaute/Archives', [
            'posts' => $posts,
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $post = Post::create([
            'user_id' => $request->user()->id,
            'shared_post_id' => $request->validated('shared_post_id'),
            'type' => $request->validated('type'),
            'body' => $request->validated('body'),
        ]);

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

    /**
     * @return array<int|string, mixed>
     */
    private function eagerLoad(): array
    {
        return [
            'user',
            'media',
            'reactions',
            'savedBy',
            'sharedPost.user',
            'sharedPost.media',
            'sharedPost.reactions',
            'comments' => fn ($query) => $query->whereNull('parent_id')->with(['user', 'replies.user', 'replies.replies.user'])->oldest(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentPost(Post $post, User $viewer, bool $nested = false): array
    {
        $reactionCounts = $post->reactions->countBy(fn (Reaction $reaction) => $reaction->type->value);
        $myReaction = $post->reactions->firstWhere('user_id', $viewer->id);

        return [
            'id' => $post->id,
            'type' => $post->type->value,
            'type_label' => $post->type->label(),
            'body' => $post->body,
            'created_at' => $post->created_at,
            'edited_at' => $post->edited_at,
            'comments_disabled' => $post->comments_disabled,
            'is_pinned' => $post->pinned_at !== null,
            'is_archived' => $post->archived_at !== null,
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar_path' => $post->user->avatar_path,
                'role_label' => $post->user->role->label(),
            ],
            'can_manage' => ! $nested && ($viewer->hasLegacyRole(Role::Admin) || $post->user_id === $viewer->id),
            'media' => $post->media->map(fn (PostMedia $media) => [
                'id' => $media->id,
                'path' => $media->path,
                'type' => $media->type->value,
            ]),
            'reactions' => collect(ReactionType::cases())
                ->mapWithKeys(fn (ReactionType $type) => [$type->value => $reactionCounts->get($type->value, 0)]),
            'my_reaction' => $myReaction?->type->value,
            'is_saved' => ! $nested && $post->savedBy->contains('id', $viewer->id),
            'shared_post' => ! $nested && $post->sharedPost ? $this->presentPost($post->sharedPost, $viewer, nested: true) : null,
            'comments' => $nested ? [] : $post->comments->map(fn (Comment $comment) => $this->presentComment($comment, $viewer)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentComment(Comment $comment, User $viewer): array
    {
        return [
            'id' => $comment->id,
            'body' => $comment->body,
            'created_at' => $comment->created_at,
            'can_manage' => $viewer->hasLegacyRole(Role::Admin) || $comment->user_id === $viewer->id,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar_path' => $comment->user->avatar_path,
            ],
            'replies' => $comment->replies->map(fn (Comment $reply) => $this->presentComment($reply, $viewer)),
        ];
    }
}
