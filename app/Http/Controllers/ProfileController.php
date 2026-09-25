<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\MediaType;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\Services\PostPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly PostPresenter $presenter) {}

    public function edit(): Response
    {
        return Inertia::render('Profile/Edit', [
            'user' => request()->user(),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->fill($request->safe()->except(['avatar', 'cover']));

        if ($request->hasFile('avatar')) {
            $user->avatar_path = $request->file('avatar')->store('avatars', 'public');
        }

        if ($request->hasFile('cover')) {
            $user->cover_path = $request->file('cover')->store('covers', 'public');
        }

        $user->save();

        return back()->with('status', 'Profil mis à jour.');
    }

    public function show(User $user): Response
    {
        $viewer = request()->user();
        $friends = $user->friends();
        $canSeeFriendsOnly = $viewer !== null && ($viewer->id === $user->id || $viewer->isFriendsWith($user));

        $visiblePosts = fn ($query) => $query
            ->whereNull('archived_at')
            ->where(fn ($q) => $q->where('visibility', 'public')->when($canSeeFriendsOnly, fn ($q2) => $q2->orWhere('visibility', 'amis')));

        $posts = $visiblePosts($user->posts())
            ->with($this->presenter->eagerLoad())
            ->withCount('viewedBy')
            ->latest()
            ->paginate(9)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => $this->presenter->present($post, $viewer));

        return Inertia::render('Profile/Show', [
            'profile' => $user->only([
                'id', 'name', 'role', 'avatar_path', 'cover_path', 'bio', 'city', 'birth_date',
                'interests', 'profession', 'employer', 'education', 'hometown',
                'facebook_url', 'linkedin_url', 'personal_website',
                'instagram_handle', 'snapchat_handle', 'tiktok_handle',
            ]),
            'isOwnProfile' => $viewer?->id === $user->id,
            'friendsCount' => $friends->count(),
            'friendsPreview' => $friends->take(9)->map(fn (User $friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'avatar_path' => $friend->avatar_path,
            ])->values(),
            'postsCount' => $visiblePosts($user->posts())->count(),
            'posts' => $posts,
            'photos' => $visiblePosts($user->posts())
                ->with(['media' => fn ($query) => $query->where('type', MediaType::Image)])
                ->get()
                ->pluck('media')
                ->flatten()
                ->map(fn (PostMedia $media) => ['id' => $media->id, 'path' => $media->path])
                ->values(),
        ]);
    }
}
