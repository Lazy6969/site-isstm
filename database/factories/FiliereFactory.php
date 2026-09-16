<?php

namespace Database\Factories;

use App\Models\Filiere;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Filiere>
 */
class FiliereFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'code' => strtoupper(fake()->lexify('???')),
            'mention' => fake()->randomElement(['STNPA', 'STI', 'STGC']),
            'niveaux' => 'L1,L2,L3',
            'slug' => str($name)->slug(),
            'nom_fr' => ucfirst($name),
            'description_fr' => fake()->paragraph(),
            'image_path' => 'images/logo-isstm.jpg',
            'display_order' => fake()->numberBetween(1, 20),
        ];
    }
}
