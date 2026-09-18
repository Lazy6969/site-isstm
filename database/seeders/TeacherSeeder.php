<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\TeacherCategory;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            [
                'name' => 'RAKOTOVELO Geoslin',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Physique',
                'specialty_en' => 'Physics',
                'specialty_mg' => 'Fizika',
                'email' => 'rakotovelo.geoslin@isstm.mg',
                'photo_path' => 'images/teachers/rakotovelo-geoslin.jpg',
                'display_order' => 1,
            ],
            [
                'name' => 'AMBEONDAHY',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Mathématiques appliquées',
                'specialty_en' => 'Applied mathematics',
                'specialty_mg' => 'Matematika ampiharina',
                'email' => 'ambeondahy@isstm.mg',
                'display_order' => 2,
            ],
            [
                'name' => 'JOHANESA Fernand',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'BTP',
                'specialty_en' => 'Building and public works',
                'specialty_mg' => 'Fanorenana',
                'email' => 'johanesa.fernand@isstm.mg',
                'display_order' => 3,
            ],
            [
                'name' => 'MANASINA Ruffin',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Électricité',
                'specialty_en' => 'Electricity',
                'specialty_mg' => 'Herinaratra',
                'email' => 'manasina.ruffin@isstm.mg',
                'photo_path' => 'images/directeur.jpg',
                'display_order' => 4,
            ],
            [
                'name' => 'RAMAROJAONA Hubert',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Génie nucléaire et automatique',
                'specialty_en' => 'Nuclear and automatic engineering',
                'specialty_mg' => 'Injeniera nokleary sy mandeha ho azy',
                'email' => 'ramarojaona.hubert@isstm.mg',
                'photo_path' => 'images/teachers/ramarojaona-hubert.jpg',
                'display_order' => 5,
            ],
            [
                'name' => 'MAXWELL Djaffard',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Physique',
                'specialty_en' => 'Physics',
                'specialty_mg' => 'Fizika',
                'email' => 'maxwell.djaffard@isstm.mg',
                'photo_path' => 'images/teachers/maxwell-djaffard.jpg',
                'display_order' => 6,
            ],
            [
                'name' => 'HARY Jean',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Physique',
                'specialty_en' => 'Physics',
                'specialty_mg' => 'Fizika',
                'email' => 'hary.jean@isstm.mg',
                'photo_path' => 'images/teachers/hary-jean.jpg',
                'display_order' => 7,
            ],
            [
                'name' => 'RANDRIAMAITSO Télesphore',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Énergétique',
                'specialty_en' => 'Energy',
                'specialty_mg' => 'Angovo',
                'email' => 'randriamaitso.telesphore@isstm.mg',
                'photo_path' => 'images/teachers/randriamaitso-telesphore.jpg',
                'display_order' => 8,
            ],
            [
                'name' => 'TSANGANDRAZANA Annicet Judicael',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Physique',
                'specialty_en' => 'Physics',
                'specialty_mg' => 'Fizika',
                'email' => 'tsangandrazana.annicet.judicael@isstm.mg',
                'photo_path' => 'images/teachers/tsangandrazana-annicet-judicael.jpg',
                'display_order' => 9,
            ],
            [
                'name' => 'ANDRIANIRINA Charles Bernard',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Électronique industrielle',
                'specialty_en' => 'Industrial electronics',
                'specialty_mg' => 'Elektronika indostrialy',
                'email' => 'andrianirina.charles.bernard@isstm.mg',
                'photo_path' => 'images/teachers/andrianirina-charles-bernard.jpg',
                'display_order' => 10,
            ],
            [
                'name' => 'ANDRIANANTENAINA Chrysostome',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Électronique et informatique',
                'specialty_en' => 'Electronics and computing',
                'specialty_mg' => 'Elektronika sy informatika',
                'email' => 'andrianantenaina.chrysostome@isstm.mg',
                'photo_path' => 'images/teachers/andrianantenaina-chrysostome.jpg',
                'display_order' => 11,
            ],
            [
                'name' => 'RAKOTOMALALA Lovasoa',
                'category' => TeacherCategory::Permanent,
                'specialty_fr' => 'Physique et automatisme',
                'specialty_en' => 'Physics and automation',
                'specialty_mg' => 'Fizika sy fanaratana',
                'email' => 'ralovas@gmail.com',
                'photo_path' => 'images/teachers/rakotomalala-lovasoa.jpg',
                'display_order' => 12,
            ],
            [
                'name' => 'ANDRINIRINIAIMALAZA Fanambinantsoa Philibert',
                'category' => TeacherCategory::Vacataire,
                'specialty_fr' => 'Électronique et informatique industrielles',
                'specialty_en' => 'Industrial electronics and computing',
                'specialty_mg' => 'Elektronika indostrialy sy informatika',
                'email' => 'andriniriniaimalaza.fanambinantsoa.philibert@isstm.mg',
                'photo_path' => 'images/teachers/andriniriniaimalaza-philibert.jpg',
                'display_order' => 13,
            ],
            [
                'name' => 'FREDERIC Moise',
                'category' => TeacherCategory::Vacataire,
                'specialty_fr' => 'Génie logiciel',
                'specialty_en' => 'Software engineering',
                'specialty_mg' => 'Injeniera rindrambaiko',
                'email' => 'frederic.moise@isstm.mg',
                'photo_path' => 'images/teachers/frederic-moise.jpg',
                'display_order' => 14,
            ],
            [
                'name' => 'BEZARA Florent',
                'category' => TeacherCategory::Vacataire,
                'specialty_fr' => 'Informatique',
                'specialty_en' => 'Computer science',
                'specialty_mg' => 'Informatika',
                'email' => 'bezara.florent@isstm.mg',
                'photo_path' => 'images/teachers/bezara-florent.jpg',
                'display_order' => 15,
            ],
            [
                'name' => 'MELRAK Nykaise',
                'category' => TeacherCategory::Vacataire,
                'specialty_fr' => 'Biomédical',
                'specialty_en' => 'Biomedical',
                'specialty_mg' => 'Biomedikaly',
                'email' => 'melrak.nykaise@isstm.mg',
                'photo_path' => 'images/teachers/melrak-nykaise.jpg',
                'display_order' => 16,
            ],
            [
                'name' => 'RUINO Randriamihaja',
                'category' => TeacherCategory::Vacataire,
                'specialty_fr' => 'Physique et applications',
                'specialty_en' => 'Physics and applications',
                'specialty_mg' => 'Fizika sy fampiharana',
                'email' => 'ruino.randriamihaja@isstm.mg',
                'photo_path' => 'images/teachers/ruino-randriamihaja.jpg',
                'display_order' => 17,
            ],
        ];

        $descriptionTemplates = [
            TeacherCategory::Permanent->value => [
                'fr' => "Enseignant(e) permanent(e) spécialisé(e) en {specialty}, au service de la réussite des étudiants de l'ISSTM.",
                'en' => 'Permanent teacher specializing in {specialty}, serving the success of ISSTM students.',
                'mg' => "Mpampianatra maharitra manam-pahaizana manokana amin'ny {specialty}, manompo ny fahombiazan'ny mpianatra ISSTM.",
            ],
            TeacherCategory::Vacataire->value => [
                'fr' => "Enseignant(e) vacataire spécialisé(e) en {specialty}, au service de la réussite des étudiants de l'ISSTM.",
                'en' => 'Part-time teacher specializing in {specialty}, serving the success of ISSTM students.',
                'mg' => "Mpampianatra tapa-potoana manokana momba ny {specialty}, manompo ny fahombiazan'ny mpianatra ISSTM.",
            ],
        ];

        foreach ($teachers as $teacher) {
            $templates = $descriptionTemplates[$teacher['category']->value];
            $teacher['description_fr'] = str_replace('{specialty}', $teacher['specialty_fr'], $templates['fr']);
            $teacher['description_en'] = str_replace('{specialty}', $teacher['specialty_en'], $templates['en']);
            $teacher['description_mg'] = str_replace('{specialty}', $teacher['specialty_mg'], $templates['mg']);

            Teacher::updateOrCreate(['email' => $teacher['email']], $teacher);
        }
    }
}
