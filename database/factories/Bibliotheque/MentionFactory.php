<?php

namespace Database\Factories\Bibliotheque;

use App\Models\Bibliotheque\Mention;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Mention>
 */
class MentionFactory extends Factory
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
        ];
    }
}
