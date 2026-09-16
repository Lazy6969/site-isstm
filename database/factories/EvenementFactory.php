<?php

namespace Database\Factories;

use App\Models\Evenement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Evenement>
 */
class EvenementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titre' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'date_debut' => fake()->dateTimeBetween('+1 day', '+2 months'),
            'lieu' => fake()->city(),
            'categorie' => fake()->randomElement(['general', 'examen', 'ceremonie', 'atelier', 'vacances', 'inscription']),
        ];
    }
}
