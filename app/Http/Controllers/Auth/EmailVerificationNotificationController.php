<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Throwable;

class EmailVerificationNotificationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('preinscription.dossier');
        }

        try {
            $request->user()->sendEmailVerificationNotification();
        } catch (Throwable $e) {
            report($e);

            return back()->with('status', "L'envoi de l'e-mail a échoué, réessayez dans quelques instants.");
        }

        return back()->with('status', "Un nouveau lien de vérification vient d'être envoyé.");
    }
}
