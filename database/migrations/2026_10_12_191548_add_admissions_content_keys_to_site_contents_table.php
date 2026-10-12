<?php

use App\SiteContentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Inserts the new content_keys the admissions banner needs via
     * insertOrIgnore rather than re-running the home content seeder, which
     * would reset every other already-customized key back to its default.
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
                'admissions_titre_ouvert',
                'Admissions ouvertes',
                'Admissions open',
                'Misokatra ny fidirana',
            ),
            $text(
                'admissions_texte_ouvert',
                "Les candidatures pour la prochaine rentrée sont ouvertes. Déposez votre dossier dès maintenant et rejoignez l'ISSTM.",
                'Applications for the upcoming academic year are open. Submit your application now and join ISSTM.',
                "Misokatra ny fangatahana ho an'ny taom-pianarana ho avy. Alefaso ny antontan-taratasinao ankehitriny ka miditra ao amin'ny ISSTM.",
            ),
            $text(
                'admissions_titre_ferme',
                'Admissions fermées',
                'Admissions closed',
                'Mihidy ny fidirana',
            ),
            $text(
                'admissions_texte_ferme',
                'Les admissions sont actuellement fermées. Revenez bientôt ou contactez-nous pour en savoir plus sur la prochaine session.',
                'Admissions are currently closed. Check back soon or contact us to learn more about the next session.',
                "Mihidy amin'izao fotoana izao ny fidirana. Avia indray tsy ho ela na mifandraisa aminay mba hahafantarana bebe kokoa momba ny fotoana manaraka.",
            ),
            [
                'content_key' => 'admissions_image_path',
                'type' => SiteContentType::Image->value,
                'content_value_fr' => 'images/accueil-rejoindre.png',
                'content_value_en' => 'images/accueil-rejoindre.png',
                'content_value_mg' => 'images/accueil-rejoindre.png',
                'style' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            $text('admissions_bouton', 'Faire une préinscription', 'Apply now', 'Manao fisoratana anarana mialoha'),
            $text('admissions_design', 'Design admissions', 'Admissions design', 'Endrika fidirana'),
        ]);
    }

    public function down(): void
    {
        DB::table('site_contents')->whereIn('content_key', [
            'admissions_titre_ouvert',
            'admissions_texte_ouvert',
            'admissions_titre_ferme',
            'admissions_texte_ferme',
            'admissions_image_path',
            'admissions_bouton',
            'admissions_design',
        ])->delete();
    }
};
