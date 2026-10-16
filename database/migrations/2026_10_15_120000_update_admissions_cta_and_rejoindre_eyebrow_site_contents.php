<?php

use App\SiteContentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Renames the "admissions_bouton" CTA (only when still carrying its old
     * default, so an admin's own customization isn't clobbered) and splits
     * the "Rejoignez l'ISSTM" banner's eyebrow into open/closed variants —
     * it used to be a single "accueil_rejoindre_eyebrow" key that always read
     * "Admissions ouvertes" regardless of the actual admissions.open setting.
     * New keys via insertOrIgnore rather than re-running the home content
     * seeder, which would reset every other already-customized key.
     */
    public function up(): void
    {
        DB::table('site_contents')
            ->where('content_key', 'admissions_bouton')
            ->where('content_value_fr', 'Faire une préinscription')
            ->update([
                'content_value_fr' => 'Lancer ma candidature',
                'content_value_en' => 'Start my application',
                'content_value_mg' => 'Manomboka ny fangatahako',
                'updated_at' => now(),
            ]);

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
            $text('accueil_rejoindre_eyebrow_ouvert', 'Admissions ouvertes', 'Admissions open', 'Misokatra ny fidirana'),
            $text('accueil_rejoindre_eyebrow_ferme', 'Admissions fermées', 'Admissions closed', 'Mihidy ny fidirana'),
        ]);
    }

    public function down(): void
    {
        DB::table('site_contents')
            ->where('content_key', 'admissions_bouton')
            ->where('content_value_fr', 'Lancer ma candidature')
            ->update([
                'content_value_fr' => 'Faire une préinscription',
                'content_value_en' => 'Apply now',
                'content_value_mg' => 'Manao fisoratana anarana mialoha',
                'updated_at' => now(),
            ]);

        DB::table('site_contents')->whereIn('content_key', [
            'accueil_rejoindre_eyebrow_ouvert',
            'accueil_rejoindre_eyebrow_ferme',
        ])->delete();
    }
};
