<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\RoleHome;
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

    public function suspended(): Response
    {
        return Inertia::render('Auth/CompteSuspendu');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        if ($request->authenticate()) {
            return redirect()->route('login.suspendu');
        }

        $request->session()->regenerate();
        // Persist the regenerated session synchronously instead of relying on
        // end-of-request save timing — the immediate redirect below issues a
        // follow-up request right away, and without this the role-gated
        // middleware on the landing page can momentarily see no authenticated
        // user and 403, even though refreshing that same page works fine.
        $request->session()->save();

        // One login form for everyone: each kind of account lands on its own
        // page (see RoleHome), unless it was heading somewhere else when the
        // login screen interrupted it.
        return redirect()->intended(RoleHome::for($request->user()));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
