<?php

namespace App\Http\Middleware;

use App\PermissionCatalog;
use App\Role;
use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates a community / group route on a permission granted from the Roles
 * screen (`access:community.view`). Two situations keep the access the account
 * had before these permissions existed, so nobody is locked out right after
 * logging in:
 *
 * - an account that only carries the legacy `users.role` value and no Spatie
 *   role at all;
 * - a database that has not created the permission yet (code pulled but
 *   `php artisan migrate` not run) — then the community roles fall back to
 *   their original role-based access instead of getting a 403 on every page.
 */
class EnsureUserCan
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->guest(route('login'));
        }

        $legacyAccess = $user->hasLegacyRole(Role::Admin, Role::Enseignant, Role::Etudiant);

        $allowed = $user->can($permission)
            || ($user->roles->isEmpty() && $legacyAccess)
            || ($this->predatesPermission($permission) && ($legacyAccess || $user->hasAnyRole(['super-admin', 'enseignant', 'etudiant'])));

        abort_unless($allowed, 403);

        return $next($request);
    }

    /**
     * True for a community permission that does not exist in this database yet.
     */
    private function predatesPermission(string $permission): bool
    {
        if (! in_array($permission, [...PermissionCatalog::COMMUNITY, ...PermissionCatalog::STUDENT_ONLY], true)) {
            return false;
        }

        return app(PermissionRegistrar::class)->getPermissions(['name' => $permission, 'guard_name' => 'web'])->isEmpty();
    }
}
