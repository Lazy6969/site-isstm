<?php

namespace Database\Factories;

use App\Models\Materiel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Materiel>
 */
class MaterielFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lieu' => fake()->randomElement(['Bureau de Direction', 'Secrétariat de Direction', 'Salle R2', 'Laboratoire GT']),
            'nom' => fake()->words(3, true),
            'quantite' => fake()->numberBetween(1, 5),
            'etat' => 'bon_etat',
            'observation' => null,
        ];
    }
}
