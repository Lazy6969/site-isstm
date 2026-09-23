<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('preinscription.dossier');
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', "Un nouveau lien de vérification vient d'être envoyé.");
    }
}
