<?php

namespace Database\Factories;

use App\Models\Partenaire;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Partenaire>
 */
class PartenaireFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->company(),
            'logo_path' => 'images/logo-isstm.jpg',
            'site_url' => fake()->url(),
            'display_order' => fake()->numberBetween(1, 20),
        ];
    }
}
