<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\Filiere;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Classe>
 */
class ClasseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => 'L1 '.fake()->randomElement(['A', 'B', 'C']),
            'filiere_id' => Filiere::factory(),
            'niveau' => 'L1',
            'annee' => (string) fake()->numberBetween(2024, 2026),
            'effectif_max' => fake()->numberBetween(30, 60),
        ];
    }
}
