<?php

namespace App\Http\Middleware;

use App\MaintenanceTemplate;
use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Paths that stay reachable regardless of maintenance mode — the way back
     * in for an admin who isn't logged in yet, and the console area those
     * routes lead to (its own auth/permission middleware still applies as
     * normal; this only stops the maintenance page itself from getting in
     * the way of them logging in and turning it back off).
     *
     * @var array<int, string>
     */
    private const ALLOWED_PATHS = [
        'login',
        'logout',
        'mot-de-passe-oublie',
        'reinitialiser-mot-de-passe',
        'reinitialiser-mot-de-passe/*',
        'verifier-email',
        'verifier-email/*',
        'console',
        'console/*',
        'up',
        'build/*',
        'images/*',
        'storage/*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (Setting::get('maintenance.enabled', 'false') !== 'true') {
            return $next($request);
        }

        // Whoever can turn this back off must never get locked out by it.
        if ($request->user()?->can('settings.manage')) {
            return $next($request);
        }

        if ($request->routeIs('password.store') || $request->is(self::ALLOWED_PATHS)) {
            return $next($request);
        }

        $template = MaintenanceTemplate::tryFrom(Setting::get('maintenance.template', '')) ?? MaintenanceTemplate::Maintenance;
        $title = Setting::get('maintenance.title') ?: $template->defaultTitle();
        $message = Setting::get('maintenance.message') ?: $template->defaultMessage();

        return response()->view('maintenance', compact('title', 'message', 'template'), 503);
    }
}
