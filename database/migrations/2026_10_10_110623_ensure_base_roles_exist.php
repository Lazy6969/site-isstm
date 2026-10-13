<?php

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * A database that was never seeded has no staff roles, so a scolarité,
     * enseignant or matériel account has nothing to be redirected by after
     * login. Seed them once in that case; a database that already has its roles
     * is left exactly as its administrators tuned it.
     */
    public function up(): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        if (Role::where('name', 'scolarite')->where('guard_name', 'web')->exists()) {
            return;
        }

        Artisan::call('db:seed', ['--class' => RolePermissionSeeder::class, '--force' => true]);
    }

    public function down(): void
    {
        // Nothing to undo: roles and permissions are never removed automatically.
    }
};
