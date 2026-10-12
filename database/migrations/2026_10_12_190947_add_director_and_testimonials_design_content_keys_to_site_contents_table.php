<?php

use App\SiteContentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Inserts the 2 new content_keys these features need via insertOrIgnore
     * rather than re-running the home content seeder, which would reset every
     * other already-customized key back to its seed default.
     */
    public function up(): void
    {
        $now = now();

        DB::table('site_contents')->insertOrIgnore([
            [
                'content_key' => 'directeur_design',
                'type' => SiteContentType::Text->value,
                'content_value_fr' => 'Design du mot du directeur',
                'content_value_en' => 'Design du mot du directeur',
                'content_value_mg' => 'Design du mot du directeur',
                'style' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'content_key' => 'temoignages_design',
                'type' => SiteContentType::Text->value,
                'content_value_fr' => 'Design des témoignages',
                'content_value_en' => 'Design des témoignages',
                'content_value_mg' => 'Design des témoignages',
                'style' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('site_contents')->whereIn('content_key', ['directeur_design', 'temoignages_design'])->delete();
    }
};
