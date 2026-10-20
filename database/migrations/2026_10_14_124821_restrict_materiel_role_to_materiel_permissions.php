<?php

use App\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * The matériel manager works in the matériel module only: its role keeps the
     * matériel permissions and nothing else (no documents, journal, settings or
     * console dashboard). Anything can still be granted back per role from the
     * Roles screen afterwards.
     */
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Role::where('name', 'responsable-materiel')->where('guard_name', 'web')->first()
            ?->syncPermissions(PermissionCatalog::MATERIEL);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Not reversible: the previous, broader permission set is not recorded.
    }
};
