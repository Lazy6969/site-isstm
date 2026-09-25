<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessKey;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AccessKeyController extends Controller
{
    public function index(): Response
    {
        foreach (AccessKey::DEPARTMENTS as $role) {
            AccessKey::firstOrCreate(['role' => $role]);
        }

        $usersCount = Role::query()
            ->withCount('users')
            ->whereIn('name', AccessKey::DEPARTMENTS)
            ->get()
            ->pluck('users_count', 'name');

        $keys = AccessKey::whereIn('role', AccessKey::DEPARTMENTS)
            ->get()
            ->keyBy('role');

        return Inertia::render('Admin/AccessKeys/Index', [
            'departments' => collect(AccessKey::DEPARTMENTS)->map(fn (string $role, string $department) => [
                'department' => $department,
                'role' => $role,
                'is_active' => $keys[$role]?->is_active ?? false,
                'has_key' => $keys[$role]?->key_hash !== null,
                'users_count' => $usersCount[$role] ?? 0,
            ])->values(),
        ]);
    }

    public function generate(string $department): RedirectResponse
    {
        $role = $this->resolveRole($department);
        $accessKey = AccessKey::firstOrCreate(['role' => $role]);
        $plain = $accessKey->generateKey();

        ActivityLog::record(
            'access_key_generated',
            "Clé d'accès régénérée pour l'espace « {$department} »",
            $accessKey,
        );

        return back()->with('status', "Nouvelle clé pour « {$department} » : {$plain} — copiez-la maintenant, elle ne sera plus jamais affichée.");
    }

    public function toggle(string $department): RedirectResponse
    {
        $role = $this->resolveRole($department);
        $accessKey = AccessKey::firstOrCreate(['role' => $role]);

        abort_if($accessKey->key_hash === null, 422, "Générez d'abord une clé avant de l'activer.");

        $accessKey->update(['is_active' => ! $accessKey->is_active]);

        ActivityLog::record(
            $accessKey->is_active ? 'access_key_activated' : 'access_key_deactivated',
            ($accessKey->is_active ? 'Clé d\'accès activée' : 'Clé d\'accès désactivée')." pour l'espace « {$department} »",
            $accessKey,
        );

        return back()->with('status', $accessKey->is_active ? 'Clé activée.' : 'Clé désactivée.');
    }

    private function resolveRole(string $department): string
    {
        abort_unless(array_key_exists($department, AccessKey::DEPARTMENTS), 404);

        return AccessKey::DEPARTMENTS[$department];
    }
}
