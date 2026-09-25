<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        // Persist the regenerated session synchronously instead of relying on
        // end-of-request save timing — the immediate redirect below issues a
        // follow-up request right away, and without this the role-gated
        // middleware on the landing page can momentarily see no authenticated
        // user and 403, even though refreshing that same page works fine.
        $request->session()->save();

        // A student's home base is the community feed, not the public homepage —
        // the rest of the site stays one click away via AppLayout's "Voir le site" link.
        $default = $request->user()->role === Role::Etudiant ? route('posts.index') : route('home');

        return redirect()->intended($default);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
