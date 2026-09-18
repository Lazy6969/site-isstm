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
        ];

        foreach ($teachers as $teacher) {
            $teacher['description_fr'] = "Enseignant(e) permanent(e) spécialisé(e) en {$teacher['specialty_fr']}, au service de la réussite des étudiants de l'ISSTM.";
            $teacher['description_en'] = "Permanent teacher specializing in {$teacher['specialty_en']}, serving the success of ISSTM students.";

            Teacher::updateOrCreate(['email' => $teacher['email']], $teacher);
        }
    }
}
