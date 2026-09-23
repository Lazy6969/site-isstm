<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
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
}
