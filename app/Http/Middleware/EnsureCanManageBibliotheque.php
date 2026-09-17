<?php

namespace App\Http\Middleware;

use App\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Grants access to the bibliotheque back-office to the dedicated Bibliotheque role, and to
 * Admin as a session bridge — mirroring the legacy reference's isAdminLogged(), where an ISSTM
 * admin already signed in on the main site reaches bibliotheque/admin/ without a second login.
 */
class EnsureCanManageBibliotheque
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        abort_if($user === null, 403);
        abort_unless($user->hasRole(Role::Admin, Role::Bibliotheque), 403);

        return $next($request);
    }
}
