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

        abort_if($user === null, 403);

        $allowed = array_map(fn (string $role) => Role::from($role), $roles);

        abort_unless($user->hasLegacyRole(...$allowed), 403);

        return $next($request);
    }
}
