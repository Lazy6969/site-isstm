<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::query()
                ->with('roles:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'avatar_path', 'is_active', 'last_activity', 'created_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_path' => $user->avatar_path,
                    'is_active' => $user->is_active,
                    'role' => $user->roles->first()?->name,
                    'last_activity' => $user->last_activity?->toIso8601String(),
                    'created_at' => $user->created_at->toIso8601String(),
                ]),
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, 'Vous ne pouvez pas modifier votre propre rôle.');

        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $previousRole = $user->roles->first()?->name;
        $user->syncRoles([$validated['role']]);

        ActivityLog::record(
            'role_changed',
            "Rôle de {$user->name} changé de « {$previousRole} » à « {$validated['role']} »",
            $user,
            ['from' => $previousRole, 'to' => $validated['role']],
        );

        return back()->with('status', 'Rôle mis à jour.');
    }

    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, 'Vous ne pouvez pas désactiver votre propre compte.');

        $user->is_active = ! $user->is_active;
        $user->save();

        ActivityLog::record(
            $user->is_active ? 'user_activated' : 'user_deactivated',
            ($user->is_active ? 'Compte réactivé : ' : 'Compte désactivé : ').$user->name,
            $user,
        );

        return back()->with('status', $user->is_active ? 'Compte réactivé.' : 'Compte désactivé.');
    }
}
