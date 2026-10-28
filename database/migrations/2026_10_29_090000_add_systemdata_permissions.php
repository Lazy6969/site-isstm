<?php

use App\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Exporting the full database, wiping all site data and pulling/building
        // the latest code are far more dangerous than the rest of Maintenance —
        // held by the Super Admin only until another role is given it from the
        // Roles screen.
        PermissionCatalog::installOnly(['super-admin' => PermissionCatalog::SYSTEMDATA]);
    }

    public function down(): void
    {
        // Additive: removing permissions could strip rights an admin has since tuned.
    }
};
