<?php

namespace Database\Seeders;

use App\Models\User;
use App\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role as SpatieRole;

class RolePermissionSeeder extends Seeder
{
    /**
     * The 5 business roles. Super Admin gets every permission via a Gate::before
     * bypass (see AppServiceProvider), not by listing permissions here.
     *
     * @var array<int, string>
     */
    private const ROLES = ['super-admin', 'enseignant', 'scolarite', 'responsable-materiel', 'etudiant'];

    /**
     * Only permissions that already have a real, enforced feature behind them.
     * Add to this list when a new module actually wires permission checks —
     * an unused permission name is dead weight.
     *
     * @var array<int, string>
     */
    private const PERMISSIONS = [
        'dashboard.view',
        'preinscriptions.manage',
        'etudiants.view', 'etudiants.create', 'etudiants.edit', 'etudiants.delete',
        'inscriptions.view', 'inscriptions.create', 'inscriptions.edit', 'inscriptions.delete',
        'classes.view', 'classes.create', 'classes.edit', 'classes.delete',
        'quick-edit.access', 'quick-edit.text', 'quick-edit.icon', 'quick-edit.image', 'quick-edit.layout',
        'news.view', 'news.create', 'news.edit', 'news.delete', 'news.publish',
        'gallery.view', 'gallery.create', 'gallery.edit', 'gallery.delete', 'gallery.publish',
        'filieres.view', 'filieres.create', 'filieres.edit', 'filieres.delete',
        'enseignants.view', 'enseignants.create', 'enseignants.edit', 'enseignants.delete',
        'temoignages.view', 'temoignages.create', 'temoignages.edit', 'temoignages.delete',
        'partenaires.view', 'partenaires.create', 'partenaires.edit', 'partenaires.delete',
        'evenements.view', 'evenements.create', 'evenements.edit', 'evenements.delete', 'evenements.publish',
        'campus.view', 'campus.create', 'campus.edit', 'campus.delete',
        'documents.view', 'documents.create', 'documents.edit', 'documents.delete',
        'users.view', 'users.edit',
        'roles.view', 'roles.edit',
        'access-keys.manage',
        'activity-log.view',
        'settings.manage',
        'statistics.view',
        'organigramme.view', 'organigramme.edit',
        'hero.view', 'hero.create', 'hero.edit', 'hero.delete',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::ROLES as $role) {
            SpatieRole::findOrCreate($role, 'web');
        }

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        SpatieRole::findByName('super-admin')->syncPermissions(self::PERMISSIONS);

        SpatieRole::findByName('scolarite')->syncPermissions([
            'dashboard.view',
            'preinscriptions.manage',
            'etudiants.view', 'etudiants.create', 'etudiants.edit', 'etudiants.delete',
            'inscriptions.view', 'inscriptions.create', 'inscriptions.edit', 'inscriptions.delete',
            'classes.view', 'classes.create', 'classes.edit', 'classes.delete',
        ]);

        $this->backfillExistingUsers();
    }

    /**
     * Assign the Spatie counterpart of each user's legacy `role` enum, so
     * accounts created before this migration are not left without one.
     */
    private function backfillExistingUsers(): void
    {
        User::query()->whereNotNull('role')->get()->each(function (User $user) {
            $spatieRole = $user->role?->spatieRole();

            if ($spatieRole !== null) {
                $user->syncRoles([$spatieRole]);
            }
        });
    }
}
