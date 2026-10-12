<?php

use App\SiteContentType;
use App\SiteIcon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Inserts the new icon content_keys the header toggles need via
     * insertOrIgnore rather than re-running the home content seeder, which
     * would reset every other already-customized key back to its default.
     */
    public function up(): void
    {
        $now = now();
        $icon = fn (string $key, SiteIcon $value) => [
            'content_key' => $key,
            'type' => SiteContentType::Icon->value,
            'content_value_fr' => $value->value,
            'content_value_en' => $value->value,
            'content_value_mg' => $value->value,
            'style' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        DB::table('site_contents')->insertOrIgnore([
            $icon('header_icone_mode_sombre', SiteIcon::Moon),
            $icon('header_icone_mode_clair', SiteIcon::Sun),
            $icon('header_icone_notifications', SiteIcon::Bell),
        ]);
    }

    public function down(): void
    {
        DB::table('site_contents')->whereIn('content_key', [
            'header_icone_mode_sombre',
            'header_icone_mode_clair',
            'header_icone_notifications',
        ])->delete();
    }
};
