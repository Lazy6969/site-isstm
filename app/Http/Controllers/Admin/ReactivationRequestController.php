<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ReactivationRequest;
use App\Notifications\AccountReactivated;
use App\Notifications\AccountReactivationRejected;
use App\ReactivationStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ReactivationRequestController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Reactivations/Index', [
            'reactivations' => ReactivationRequest::with(['user:id,name,email', 'reviewer:id,name'])
                ->latest()
                ->get(),
        ]);
    }

    public function approve(ReactivationRequest $reactivation): RedirectResponse
    {
        abort_if($reactivation->status !== ReactivationStatus::EnAttente, 409, 'Cette demande a déjà été traitée.');

        $user = $reactivation->user;
        $user->is_active = true;
        $user->save();

        $reactivation->update([
            'status' => ReactivationStatus::Approuvee,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        try {
            $user->notify(new AccountReactivated);
        } catch (Throwable $e) {
            report($e);
        }

        ActivityLog::record('reactivation_approved', "Compte réactivé pour {$user->name}", $reactivation);

        return back()->with('status', "Compte de {$user->name} réactivé.");
    }

    public function refuse(Request $request, ReactivationRequest $reactivation): RedirectResponse
    {
        abort_if($reactivation->status !== ReactivationStatus::EnAttente, 409, 'Cette demande a déjà été traitée.');

        $validated = $request->validate(['motif_refus' => ['nullable', 'string', 'max:1000']]);

        $reactivation->update([
            'status' => ReactivationStatus::Refusee,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'motif_refus' => $validated['motif_refus'] ?? null,
        ]);

        try {
            $reactivation->user->notify(new AccountReactivationRejected($validated['motif_refus'] ?? null));
        } catch (Throwable $e) {
            report($e);
        }

        ActivityLog::record('reactivation_refused', "Réactivation refusée pour {$reactivation->user->name}", $reactivation);

        return back()->with('status', "Demande de {$reactivation->user->name} refusée.");
    }
}
