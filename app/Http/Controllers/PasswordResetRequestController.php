<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Notifications\PasswordResetRequested;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

/**
 * The student's side: ask the administration to reset their password. The
 * request waits for an administrator (see Admin\PasswordResetRequestController).
 */
class PasswordResetRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->passwordResetRequests()->enAttente()->exists()) {
            return back()->with('status', 'Votre demande est déjà en attente de validation.');
        }

        $resetRequest = $user->passwordResetRequests()->create();

        Notification::send(User::permission('security.manage')->get(), new PasswordResetRequested($resetRequest));

        ActivityLog::record('password_reset_requested', "{$user->name} a demandé la réinitialisation de son mot de passe.", $resetRequest);

        return back()->with('status', "Demande envoyée. Vous recevrez un e-mail dès que l'administration l'aura validée.");
    }
}
