<?php

namespace Database\Factories;

use App\Models\Materiel;
use App\Models\MaterielDeplacement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MaterielDeplacement>
 */
class MaterielDeplacementFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'materiel_id' => Materiel::factory(),
            'lieu_origine' => 'Bureau de Direction',
            'lieu_destination' => 'Salle R2',
            'motif' => fake()->sentence(),
            'emprunteur' => fake()->name(),
            'quantite' => 1,
            'statut' => 'en_cours',
        ];
    }
}
