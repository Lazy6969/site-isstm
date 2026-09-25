<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\MediaType;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
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
        $posts = $user->posts()
            ->with('media')
            ->latest()
            ->paginate(9)
            ->withQueryString();

        $posts->getCollection()->transform(fn (Post $post) => [
            'id' => $post->id,
            'body' => $post->body,
            'created_at' => $post->created_at,
            'media' => $post->media->map(fn (PostMedia $media) => [
                'id' => $media->id,
                'path' => $media->path,
                'type' => $media->type->value,
            ]),
        ]);

        return Inertia::render('Profile/Show', [
            'profile' => $user->only([
                'id', 'name', 'role', 'avatar_path', 'cover_path', 'bio', 'city',
                'interests', 'facebook_url', 'linkedin_url', 'personal_website',
            ]),
            'friendsCount' => $user->friends()->count(),
            'postsCount' => $user->posts()->count(),
            'posts' => $posts,
            'photos' => $user->posts()
                ->with(['media' => fn ($query) => $query->where('type', MediaType::Image)])
                ->get()
                ->pluck('media')
                ->flatten()
                ->map(fn (PostMedia $media) => ['id' => $media->id, 'path' => $media->path])
                ->values(),
        ]);
    }
}
