<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Roles/Index', [
            'roles' => Role::query()
                ->withCount('users')
                ->with('permissions:id,name')
                ->orderBy('name')
                ->get()
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'users_count' => $role->users_count,
                    'permissions' => $role->permissions->pluck('name'),
                ]),
            'permissions' => Permission::orderBy('name')->pluck('name'),
            // Direct permissions granted straight to an account, on top of
            // whatever its role already gives it (see updateUserPermissions) —
            // role_permissions ships too so the UI can show those as already
            // granted (and non-togglable here, since this screen only edits
            // the direct ones).
            'users' => User::query()
                ->with(['roles:id,name', 'roles.permissions:id,name', 'permissions:id,name'])
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'avatar_path'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_path' => $user->avatar_path,
                    'role' => $user->roles->first()?->name,
                    'permissions' => $user->permissions->pluck('name'),
                    'role_permissions' => $user->getPermissionsViaRoles()->pluck('name'),
                ]),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        abort_if($role->name === 'super-admin', 403, 'Les permissions du Super Admin ne sont pas modifiables.');

        $validated = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $previousPermissions = $role->permissions->pluck('name')->all();
        $role->syncPermissions($validated['permissions'] ?? []);

        ActivityLog::record(
            'role_permissions_updated',
            "Permissions du rôle « {$role->name} » modifiées",
            $role,
            ['from' => $previousPermissions, 'to' => $validated['permissions'] ?? []],
        );

        return back()->with('status', 'Permissions mises à jour.');
    }

    /**
     * Permissions granted straight to one account, additive on top of its
     * role (Spatie's `can()` checks role permissions OR direct ones — this
     * never revokes something the role already grants). Locked the same way
     * as the super-admin role: that account bypasses every check via
     * Gate::before regardless of what's set here, so editing it would be
     * meaningless and confusing to show as "on".
     */
    public function updateUserPermissions(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, 'Vous ne pouvez pas modifier vos propres permissions.');
        abort_if($user->hasRole('super-admin'), 403, 'Les permissions du Super Admin ne sont pas modifiables.');

        $validated = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $previousPermissions = $user->getDirectPermissions()->pluck('name')->all();
        $user->syncPermissions($validated['permissions'] ?? []);

        ActivityLog::record(
            'user_permissions_updated',
            "Permissions directes de {$user->name} modifiées",
            $user,
            ['from' => $previousPermissions, 'to' => $validated['permissions'] ?? []],
        );

        return back()->with('status', 'Permissions mises à jour.');
    }
}
