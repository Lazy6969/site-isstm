<?php

namespace App\Http\Controllers;

use App\Models\ReactivationRequest;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\ReactivationRequested;
use App\ReactivationStatus;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ReactivationRequestController extends Controller
{
    private const GENERIC_STATUS = "Votre demande a été transmise à la scolarité. Vous recevrez un e-mail dès qu'elle sera traitée.";

    private const NO_ACCOUNT_STATUS = "Aucun compte n'existe pour cette adresse e-mail.";

    public function create(): Response|RedirectResponse
    {
        // Already an active student account: there is nothing to reactivate.
        if (Auth::user()?->role === Role::Etudiant && Auth::user()->is_active) {
            return redirect()->route('rejoindre')->with('status', 'Vous êtes déjà inscrit(e) en tant qu’étudiant.');
        }

        if (Setting::get('inscriptions.closed', 'false') === 'true') {
            return redirect()->route('rejoindre')->with(
                'status',
                Setting::get('inscriptions.closed_message') ?: 'Les inscriptions sont actuellement fermées.',
            );
        }

        return Inertia::render('AncienEtudiant/Verifier');
    }

    /**
     * Tells an anonymous visitor plainly when no account exists for the
     * address they entered, or when the password doesn't match it — a
     * deliberate exception to the usual "never reveal account existence"
     * caution (see password-reset flow), at the site owner's request, since
     * a former student with no account left otherwise has no way to know
     * they should apply as a new candidate instead. Requiring the password
     * also proves it's really the account holder asking, not just anyone
     * who knows the e-mail address, before a reactivation request reaches
     * the admin's queue. Every other case (already active, already has a
     * pending request) stays folded into the same generic "transmitted"
     * message. Sent as `error` rather than `status` so the frontend can
     * render it as a failure rather than a success panel/toast.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return back()->with('error', self::NO_ACCOUNT_STATUS);
        }

        if (! $user->is_active) {
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
