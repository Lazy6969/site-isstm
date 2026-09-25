<?php

namespace App\Http\Middleware;

use App\Models\AccessKey;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Re-checked on every request to a department subdomain's protected routes —
 * not just at login — so a Super Admin disabling a department's access key
 * immediately locks out anyone already signed in there.
 */
class EnsureAccessKeyActive
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        // A session cookie is shared across the whole site (main domain +
        // department subdomains), so a user already signed in elsewhere can
        // land here without ever seeing this department's login form. Send
        // them there instead of a bare 403 when their account isn't a fit.
        if ($user === null) {
            return $this->denyAccess($request, $role, null);
        }

        if (! $user->hasRole($role)) {
            return $this->denyAccess(
                $request,
                $role,
                "Ce compte n'a pas accès à cet espace. Connectez-vous avec un identifiant autorisé pour ce département.",
            );
        }

        if (! $user->is_active) {
            return $this->denyAccess($request, $role, 'Ce compte a été désactivé. Contactez un administrateur.');
        }

        $accessKey = AccessKey::where('role', $role)->first();

        if ($accessKey === null || ! $accessKey->is_active) {
            return $this->denyAccess(
                $request,
                $role,
                "Votre clé d'accès est actuellement désactivée. Veuillez contacter le Super Administrateur.",
            );
        }

        return $next($request);
    }

    private function denyAccess(Request $request, string $role, ?string $message): Response
    {
        if ($request->user() !== null) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $department = array_search($role, AccessKey::DEPARTMENTS, true) ?: $role;

        $redirect = redirect()->route("{$department}.login");

        return $message === null ? $redirect : $redirect->withErrors(['email' => $message]);
    }
}
