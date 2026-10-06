<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InscriptionSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Inscriptions', [
            'settings' => [
                'closed' => Setting::get('inscriptions.closed', 'false') === 'true',
                'message' => Setting::get('inscriptions.closed_message', ''),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'closed' => ['required', 'boolean'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        Setting::set('inscriptions.closed', $validated['closed'] ? 'true' : 'false');
        Setting::set('inscriptions.closed_message', $validated['message'] ?? '');

        ActivityLog::record(
            $validated['closed'] ? 'inscriptions_closed' : 'inscriptions_reopened',
            $validated['closed']
                ? 'Préinscription et réactivation de compte fermées pour les visiteurs'
                : 'Préinscription et réactivation de compte rouvertes aux visiteurs',
        );

        return back()->with('status', $validated['closed'] ? 'Les inscriptions sont désormais fermées.' : 'Les inscriptions sont de nouveau ouvertes.');
    }
}
