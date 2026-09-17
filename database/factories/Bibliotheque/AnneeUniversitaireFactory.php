<?php

namespace Database\Factories\Bibliotheque;

use App\Models\Bibliotheque\AnneeUniversitaire;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnneeUniversitaire>
 */
class AnneeUniversitaireFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->unique()->numberBetween(2015, 2035);

        return [
            'libelle' => "{$start}-".($start + 1),
        ];
    }
}
