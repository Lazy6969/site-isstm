<?php

namespace Database\Factories\Bibliotheque;

use App\CanevasNiveau;
use App\Models\Bibliotheque\Filiere;
use App\Models\Bibliotheque\Mention;
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
        $nom = fake()->unique()->words(2, true);

        return [
            'nom' => $nom,
            'abreviation' => strtoupper(substr($nom, 0, 4)),
            'niveau' => fake()->randomElement(CanevasNiveau::cases()),
            'mention_id' => Mention::factory(),
        ];
    }
}
