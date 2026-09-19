<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\MediaType;
use App\Models\Comment;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Reaction;
use App\Models\User;
use App\Notifications\NewPostPublished;
use App\PostType;
use App\Role;
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
            ->with([
                'user',
                'media',
                'reactions',
                'comments' => fn ($query) => $query->whereNull('parent_id')->with(['user', 'replies.user'])->oldest(),
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => $this->presentPost($post, $user));

        return Inertia::render('Communaute/Index', [
            'posts' => $posts,
            'canPublish' => $user->hasLegacyRole(Role::Admin, Role::Enseignant),
            'postTypes' => array_map(fn (PostType $type) => ['value' => $type->value, 'label' => $type->label()], PostType::cases()),
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $post = Post::create([
            'user_id' => $request->user()->id,
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

        return back()->with('status', 'Publication créée.');
    }

    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasLegacyRole(Role::Admin) || $post->user_id === $user->id, 403);

        $post->delete();

        return back()->with('status', 'Publication supprimée.');
    }

    /**
     * @return array<string, mixed>
     */
    private function presentPost(Post $post, User $viewer): array
    {
        $reactionCounts = $post->reactions->countBy(fn (Reaction $reaction) => $reaction->type->value);
        $myReaction = $post->reactions->firstWhere('user_id', $viewer->id);

        return [
            'id' => $post->id,
            'type' => $post->type->value,
            'type_label' => $post->type->label(),
            'body' => $post->body,
            'created_at' => $post->created_at,
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar_path' => $post->user->avatar_path,
                'role_label' => $post->user->role->label(),
            ],
            'can_manage' => $viewer->hasLegacyRole(Role::Admin) || $post->user_id === $viewer->id,
            'media' => $post->media->map(fn (PostMedia $media) => [
                'id' => $media->id,
                'path' => $media->path,
                'type' => $media->type->value,
            ]),
            'likes' => $reactionCounts->get('like', 0),
            'loves' => $reactionCounts->get('love', 0),
            'my_reaction' => $myReaction?->type->value,
            'comments' => $post->comments->map(fn (Comment $comment) => $this->presentComment($comment, $viewer)),
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
