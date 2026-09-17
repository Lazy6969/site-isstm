<?php

namespace Database\Seeders;

use App\CanevasNiveau;
use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Filiere;
use App\Models\Bibliotheque\Mention;
use Illuminate\Database\Seeder;

class BibliothequeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mentions = [
            'STNPA' => Mention::query()->firstOrCreate(['abreviation' => 'STNPA'], [
                'nom' => 'Sciences et Techniques du Numérique et Physiques Appliquées',
            ]),
            'STI' => Mention::query()->firstOrCreate(['abreviation' => 'STI'], [
                'nom' => 'Sciences et Technologies Industrielles',
            ]),
            'STGC' => Mention::query()->firstOrCreate(['abreviation' => 'STGC'], [
                'nom' => 'Sciences et Techniques du Génie Civil',
            ]),
        ];

        $filieres = [
            ['nom' => 'Génie Informatique', 'abreviation' => 'GI', 'mention' => 'STNPA', 'niveaux' => [CanevasNiveau::Licence]],
            ['nom' => 'Génie Biomédical', 'abreviation' => 'GB', 'mention' => 'STNPA', 'niveaux' => [CanevasNiveau::Licence, CanevasNiveau::Master]],
            ['nom' => 'Génie Électronique et Informatique', 'abreviation' => 'GEI', 'mention' => 'STNPA', 'niveaux' => [CanevasNiveau::Licence]],
            ['nom' => 'Génie Électrique', 'abreviation' => 'GE', 'mention' => 'STI', 'niveaux' => [CanevasNiveau::Licence]],
            ['nom' => 'Génie Civil', 'abreviation' => 'GCIVIL', 'mention' => 'STGC', 'niveaux' => [CanevasNiveau::Licence, CanevasNiveau::Master]],
        ];

        foreach ($filieres as $filiere) {
            foreach ($filiere['niveaux'] as $niveau) {
                Filiere::query()->firstOrCreate([
                    'abreviation' => $filiere['abreviation'],
                    'niveau' => $niveau,
                ], [
                    'nom' => $filiere['nom'],
                    'mention_id' => $mentions[$filiere['mention']]->id,
                ]);
            }
        }

        foreach (['2023-2024', '2024-2025', '2025-2026'] as $libelle) {
            AnneeUniversitaire::query()->firstOrCreate(['libelle' => $libelle]);
        }
    }
}
