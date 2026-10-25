<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PasswordResetRequest;
use App\Notifications\PasswordResetApproved;
use App\Notifications\PasswordResetRefused;
use App\PasswordResetRequestStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The "Sécurité" screen: students' password-reset requests waiting for an
 * administrator. Accepting one puts the temporary password on the account and
 * e-mails it to the student; refusing one just closes it.
 */
class PasswordResetRequestController extends Controller
{
    public function index(): Response
    {
        $requests = PasswordResetRequest::with(['user:id,name,email,avatar_path', 'handler:id,name'])
            ->orderByRaw("case when status = 'en_attente' then 0 else 1 end")
            ->latest()
            ->limit(200)
            ->get();

        return Inertia::render('Admin/Securite/Index', [
            'requests' => $requests->map(fn (PasswordResetRequest $item) => [
                'id' => $item->id,
                'status' => $item->status->value,
                'status_label' => $item->status->label(),
                'created_at' => $item->created_at,
                'handled_at' => $item->handled_at,
                'handler' => $item->handler?->name,
                'user' => [
                    'name' => $item->user->name,
                    'email' => $item->user->email,
                    'avatar_path' => $item->user->avatar_path,
                ],
            ]),
        ]);
    }

    public function approve(PasswordResetRequest $passwordResetRequest, Request $request): RedirectResponse
    {
        abort_unless($passwordResetRequest->status === PasswordResetRequestStatus::EnAttente, 409, 'Cette demande a déjà été traitée.');

        $user = $passwordResetRequest->user;

        DB::transaction(function () use ($passwordResetRequest, $user, $request) {
            $user->forceFill(['password' => Hash::make(PasswordResetRequest::TEMPORARY_PASSWORD)])->save();

            $passwordResetRequest->update([
                'status' => PasswordResetRequestStatus::Accepte,
                'handled_by' => $request->user()->id,
                'handled_at' => now(),
            ]);
        });

        $user->notify(new PasswordResetApproved);

        ActivityLog::record('password_reset_approved', "Réinitialisation du mot de passe de {$user->name} acceptée.", $passwordResetRequest);

        return back()->with('status', "Mot de passe réinitialisé : le mot de passe temporaire a été envoyé à {$user->email}.");
    }

    public function refuse(PasswordResetRequest $passwordResetRequest, Request $request): RedirectResponse
    {
        abort_unless($passwordResetRequest->status === PasswordResetRequestStatus::EnAttente, 409, 'Cette demande a déjà été traitée.');

        $passwordResetRequest->update([
            'status' => PasswordResetRequestStatus::Refuse,
            'handled_by' => $request->user()->id,
            'handled_at' => now(),
        ]);

        $passwordResetRequest->user->notify(new PasswordResetRefused);

        ActivityLog::record('password_reset_refused', "Réinitialisation du mot de passe de {$passwordResetRequest->user->name} refusée.", $passwordResetRequest);

        return back()->with('status', 'Demande refusée.');
    }
}
