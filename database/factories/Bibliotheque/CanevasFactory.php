<?php

namespace Database\Factories\Bibliotheque;

use App\CanevasNiveau;
use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Canevas;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Canevas>
 */
class CanevasFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titre' => 'Canevas '.fake()->words(2, true),
            'niveau' => fake()->randomElement(CanevasNiveau::cases()),
            'annee_id' => AnneeUniversitaire::factory(),
            'type_fichier' => 'word',
            'chemin_fichier' => 'canevas/'.fake()->uuid().'.docx',
        ];
    }
}
