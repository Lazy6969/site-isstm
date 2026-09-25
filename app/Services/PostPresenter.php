<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Reaction;
use App\Models\User;
use App\ReactionType;
use App\Role;

/**
 * Shapes a Post (and its comments) into the array the community feed's
 * PostCard expects — shared by PostController (feed/permalink/saved/archives)
 * and ProfileController (a user's own posts on their profile), so both
 * render with the same reactions/comments/media/tags feature set instead of
 * the profile page carrying a second, thinner post shape.
 */
class PostPresenter
{
    /**
     * @return array<int|string, mixed>
     */
    public function eagerLoad(): array
    {
        return [
            'user',
            'media',
            'reactions',
            'savedBy',
            'taggedUsers',
            'sharedPost.user',
            'sharedPost.media',
            'sharedPost.reactions',
            'comments' => fn ($query) => $query->whereNull('parent_id')->with(['user', 'replies.user', 'replies.replies.user'])->oldest(),
        ];
    }

    /**
     * $viewer is nullable — ProfileController's /profil/{user} is reachable
     * by guests, unlike every PostController route (all behind 'auth').
     *
     * @return array<string, mixed>
     */
    public function present(Post $post, ?User $viewer, bool $nested = false): array
    {
        $reactionCounts = $post->reactions->countBy(fn (Reaction $reaction) => $reaction->type->value);
        $myReaction = $viewer ? $post->reactions->firstWhere('user_id', $viewer->id) : null;

        return [
            'id' => $post->id,
            'type' => $post->type->value,
            'type_label' => $post->type->label(),
            'body' => $post->body,
            'visibility' => $post->visibility->value,
            'mood' => $post->mood,
            'location' => $post->location,
            'created_at' => $post->created_at,
            'edited_at' => $post->edited_at,
            'comments_disabled' => $post->comments_disabled,
            'views_count' => $nested ? 0 : ($post->viewed_by_count ?? 0),
            'is_pinned' => $post->pinned_at !== null,
            'is_archived' => $post->archived_at !== null,
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar_path' => $post->user->avatar_path,
                'role_label' => $post->user->role->label(),
            ],
            'can_manage' => ! $nested && $viewer !== null && ($viewer->hasLegacyRole(Role::Admin) || $post->user_id === $viewer->id),
            'media' => $post->media->map(fn (PostMedia $media) => [
                'id' => $media->id,
                'path' => $media->path,
                'type' => $media->type->value,
            ]),
            'reactions' => collect(ReactionType::cases())
                ->mapWithKeys(fn (ReactionType $type) => [$type->value => $reactionCounts->get($type->value, 0)]),
            'my_reaction' => $myReaction?->type->value,
            'is_saved' => ! $nested && $viewer !== null && $post->savedBy->contains('id', $viewer->id),
            'tagged_users' => $post->taggedUsers->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name]),
            'shared_post' => ! $nested && $post->sharedPost ? $this->present($post->sharedPost, $viewer, nested: true) : null,
            'comments' => $nested ? [] : $post->comments->map(fn (Comment $comment) => $this->presentComment($comment, $viewer)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentComment(Comment $comment, ?User $viewer): array
    {
        return [
            'id' => $comment->id,
            'body' => $comment->body,
            'created_at' => $comment->created_at,
            'edited_at' => $comment->edited_at,
            'can_manage' => $viewer !== null && ($viewer->hasLegacyRole(Role::Admin) || $comment->user_id === $viewer->id),
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar_path' => $comment->user->avatar_path,
            ],
            'replies' => $comment->replies->map(fn (Comment $reply) => $this->presentComment($reply, $viewer)),
        ];
    }
}
