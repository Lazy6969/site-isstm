<?php

use App\SiteContentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Inserts the single new content_key this feature needs via insertOrIgnore
     * rather than re-running the home content seeder, which would reset every
     * other already-customized key back to its seed default.
     */
    public function up(): void
    {
        DB::table('site_contents')->insertOrIgnore([
            'content_key' => 'stat_design',
            'type' => SiteContentType::Text->value,
            'content_value_fr' => 'Design des statistiques',
            'content_value_en' => 'Design des statistiques',
            'content_value_mg' => 'Design des statistiques',
            'style' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('site_contents')->where('content_key', 'stat_design')->delete();
    }
};
