<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Whoever can open the journal d'activité sees its delete icon: give the new
     * permission to every role that already holds "consulter le journal".
     * Additive, and it can still be removed per role from the Roles screen.
     */
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::findOrCreate('activity-log.delete', 'web');

        Role::where('guard_name', 'web')->get()
            ->filter(fn (Role $role) => $role->permissions->contains('name', 'activity-log.view'))
            ->each(fn (Role $role) => $role->givePermissionTo('activity-log.delete'));

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Additive: nothing to undo.
    }
};
