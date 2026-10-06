<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * The department access keys are gone: every account now signs in through
     * the single login form. Drop their table and the permission that
     * managed them.
     */
    public function up(): void
    {
        Schema::dropIfExists('access_keys');

        Permission::query()->where('name', 'access-keys.manage')->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Schema::create('access_keys', function (Blueprint $table) {
            $table->id();
            $table->string('role')->unique();
            $table->string('key_hash')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }
};
