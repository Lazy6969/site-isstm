<?php

use App\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PermissionCatalog::installOnly([
            'super-admin' => PermissionCatalog::COMMUNITY_DOCUMENTS,
        ]);
    }

    public function down(): void
    {
        //
    }
};
