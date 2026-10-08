<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\MaintenanceTemplate;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Maintenance', [
            'settings' => [
                'enabled' => Setting::get('maintenance.enabled', 'false') === 'true',
                'template' => Setting::get('maintenance.template', MaintenanceTemplate::Maintenance->value),
                'title' => Setting::get('maintenance.title', ''),
                'message' => Setting::get('maintenance.message', ''),
            ],
            'templates' => MaintenanceTemplate::options(),
            // Préinscription/réactivation gating used to live on its own page
            // (/console/settings/inscriptions) — folded in here since both
            // toggles answer the same question ("can visitors reach the site
            // right now?"). The Setting keys themselves (inscriptions.closed /
            // inscriptions.closed_message) are unchanged, so every place that
            // reads them (PreinscriptionController, ReactivationRequestController,
            // HandleInertiaRequests) keeps working untouched.
            'inscriptionSettings' => [
                'closed' => Setting::get('inscriptions.closed', 'false') === 'true',
                'message' => Setting::get('inscriptions.closed_message', ''),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
            'template' => ['required', Rule::enum(MaintenanceTemplate::class)],
            'title' => ['nullable', 'string', 'max:150'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        Setting::set('maintenance.enabled', $validated['enabled'] ? 'true' : 'false');
        Setting::set('maintenance.template', $validated['template']);
        Setting::set('maintenance.title', $validated['title'] ?? '');
        Setting::set('maintenance.message', $validated['message'] ?? '');

        ActivityLog::record(
            $validated['enabled'] ? 'maintenance_enabled' : 'maintenance_disabled',
            $validated['enabled'] ? "Mode maintenance activé pour l'ensemble du site" : 'Mode maintenance désactivé — le site est de nouveau accessible',
            null,
            $validated,
        );

        return back()->with('status', $validated['enabled'] ? 'Le site est maintenant en maintenance.' : 'Le site est de nouveau accessible à tous.');
    }

    /**
     * Ported from the former InscriptionSettingsController — same Setting
     * keys (inscriptions.closed / inscriptions.closed_message), only the
     * admin page/route moved.
     */
    public function updateInscriptions(Request $request): RedirectResponse
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

    /**
     * Renders the exact page a visitor would see, from whatever is currently
     * typed in the settings form — never from the saved setting — so the
     * admin can check every template/text combination before turning
     * anything on for real visitors. Never itself blocked by maintenance
     * mode: only reachable by someone who already holds `settings.manage`,
     * the same permission the whole feature is gated behind.
     */
    public function preview(Request $request): View
    {
        $template = MaintenanceTemplate::tryFrom((string) $request->query('template')) ?? MaintenanceTemplate::Maintenance;
        $title = $request->query('title') ?: $template->defaultTitle();
        $message = $request->query('message') ?: $template->defaultMessage();

        return view('maintenance', compact('title', 'message', 'template'));
    }
}
