<?php

use App\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PermissionCatalog::install();
    }

    public function down(): void
    {
        // Permissions are additive and cheap to keep; removing them could strip rights admins have since tuned.
    }
};
