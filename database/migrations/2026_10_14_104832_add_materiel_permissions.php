<?php

use App\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PermissionCatalog::installOnly(['responsable-materiel' => PermissionCatalog::MATERIEL]);
    }

    public function down(): void
    {
        // Additive: removing permissions could strip rights an admin has since tuned.
    }
};
