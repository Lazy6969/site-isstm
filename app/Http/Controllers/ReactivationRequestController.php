<?php

namespace App\Http\Controllers;

use App\Models\ReactivationRequest;
use App\Models\User;
use App\Notifications\ReactivationRequested;
use App\ReactivationStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ReactivationRequestController extends Controller
{
    private const GENERIC_STATUS = "Si un compte existe pour cette adresse, votre demande a été transmise à la scolarité. Vous recevrez un e-mail dès qu'elle sera traitée.";

    public function create(): Response
    {
        return Inertia::render('AncienEtudiant/Verifier');
    }

    /**
     * Always returns the same generic message regardless of whether the
     * email matches an account, is already active, or already has a
     * pending request — same reasoning as the password-reset flow: never
     * reveal account existence to an anonymous visitor.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $validated['email'])->first();

        if ($user && ! $user->is_active) {
            $alreadyPending = ReactivationRequest::where('user_id', $user->id)
                ->where('status', ReactivationStatus::EnAttente)
                ->exists();

            if (! $alreadyPending) {
                $reactivation = ReactivationRequest::create([
                    'user_id' => $user->id,
                    'status' => ReactivationStatus::EnAttente,
                ]);

                try {
                    Notification::send(User::permission('reactivations.manage')->get(), new ReactivationRequested($reactivation));
                } catch (Throwable $e) {
                    report($e);
                }
            }
        }

        return back()->with('status', self::GENERIC_STATUS);
    }
}
