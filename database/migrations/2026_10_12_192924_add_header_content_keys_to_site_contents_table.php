<?php

use App\SiteContentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Inserts the new content_keys the site header needs via insertOrIgnore
     * rather than re-running the home content seeder, which would reset every
     * other already-customized key back to its default.
     */
    public function up(): void
    {
        $now = now();
        $text = fn (string $key, string $fr, string $en, string $mg) => [
            'content_key' => $key,
            'type' => SiteContentType::Text->value,
            'content_value_fr' => $fr,
            'content_value_en' => $en,
            'content_value_mg' => $mg,
            'style' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        DB::table('site_contents')->insertOrIgnore([
            $text(
                'header_titre_ligne1',
                'Institut Supérieur des Sciences',
                'Institut Supérieur des Sciences',
                'Institut Supérieur des Sciences',
            ),
            $text(
                'header_titre_ligne2',
                'et Technologies de Mahajanga',
                'et Technologies de Mahajanga',
                'et Technologies de Mahajanga',
            ),
            $text(
                'header_devise',
                'Honnêteté - Discipline - Excellence',
                'Honnêteté - Discipline - Excellence',
                'Honnêteté - Discipline - Excellence',
            ),
            [
                'content_key' => 'header_logo_image_path',
                'type' => SiteContentType::Image->value,
                'content_value_fr' => 'images/logo-isstm.svg',
                'content_value_en' => 'images/logo-isstm.svg',
                'content_value_mg' => 'images/logo-isstm.svg',
                'style' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            $text('header_design', 'Design du header', 'Header design', 'Endrika lohapejy'),
        ]);
    }

    public function down(): void
    {
        DB::table('site_contents')->whereIn('content_key', [
            'header_titre_ligne1',
            'header_titre_ligne2',
            'header_devise',
            'header_logo_image_path',
            'header_design',
        ])->delete();
    }
};
