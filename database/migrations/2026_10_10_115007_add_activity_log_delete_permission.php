<?php

use App\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Held by the Super Admin only until another role is given it from the Roles screen.
        PermissionCatalog::installOnly(['super-admin' => PermissionCatalog::ACTIVITY_LOG]);
    }

    public function down(): void
    {
        // Additive: removing permissions could strip rights an admin has since tuned.
    }
};
