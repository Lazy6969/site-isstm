<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SecurityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        SecurityLog::record(
            $status === Password::RESET_LINK_SENT ? 'reset_link_sent' : 'reset_link_unknown_email',
            $request->string('email'),
        );

        // Message générique dans tous les cas : ne jamais révéler si un e-mail est enregistré.
        return back()->with('status', "Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé.");
    }
}
