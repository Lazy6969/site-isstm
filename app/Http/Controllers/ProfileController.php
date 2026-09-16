<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
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

        $user->fill($request->safe()->except('avatar'));

        if ($request->hasFile('avatar')) {
            $user->avatar_path = $request->file('avatar')->store('avatars', 'public');
        }

        $user->save();

        return back()->with('status', 'Profil mis à jour.');
    }

    public function show(User $user): Response
    {
        return Inertia::render('Profile/Show', [
            'profile' => $user->only([
                'id', 'name', 'role', 'avatar_path', 'bio', 'city',
                'interests', 'facebook_url', 'linkedin_url', 'personal_website',
            ]),
        ]);
    }
}
