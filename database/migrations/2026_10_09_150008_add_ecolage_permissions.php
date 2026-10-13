<?php

use App\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PermissionCatalog::installOnly([
            'etudiant' => PermissionCatalog::ECOLAGE_STUDENT,
            'scolarite' => PermissionCatalog::PAYMENTS,
        ]);
    }

    public function down(): void
    {
        // Additive: removing permissions could strip rights an admin has since tuned.
    }
};
