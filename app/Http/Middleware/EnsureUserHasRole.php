<?php

namespace App\Http\Middleware;

use App\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // A null user here means the session wasn't recognized as authenticated
        // yet (e.g. the very first request right after login, before the fresh
        // session write is visible) — send back to login rather than a dead-end
        // 403, since the 'auth' middleware ahead of this one already redirects
        // genuine guests instead of letting them reach this point.
        if ($user === null) {
            return redirect()->guest(route('login'));
        }

        $allowed = array_map(fn (string $role) => Role::from($role), $roles);

        abort_unless($user->hasLegacyRole(...$allowed), 403);

        return $next($request);
    }
}
