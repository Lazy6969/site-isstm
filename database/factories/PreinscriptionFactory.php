<?php

namespace Database\Factories;

use App\Models\Filiere;
use App\Models\Preinscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Preinscription>
 */
class PreinscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => strtoupper(fake()->lastName()),
            'prenoms' => fake()->firstName(),
            'sexe' => fake()->randomElement(['M', 'F']),
            'date_naissance' => fake()->date(),
            'lieu_naissance' => fake()->city(),
            'nationalite' => 'Malgache',
            'annee_bacc' => (string) fake()->numberBetween(2020, 2026),
            'serie_bacc' => 'D',
            'mention_bacc' => 'Passable',
            'code_redoublement' => 'N',
            'adresse' => fake()->address(),
            'telephone' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'pays' => 'Madagascar',
            'filiere_id' => Filiere::factory(),
            'niveau' => 'L1',
            'photo_path' => 'preinscriptions/photo.jpg',
        ];
    }
}
