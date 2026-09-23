<?php

namespace Database\Factories;

use App\Models\Filiere;
use App\Models\Preinscription;
use App\Models\User;
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
            'civilite' => fake()->randomElement(['M', 'Mme', 'Mlle']),
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
            'contact_parents' => fake()->phoneNumber(),
            'pays' => 'Madagascar',
            'filiere_id' => Filiere::factory(),
            'niveau' => 'L1',
            'photo_path' => 'preinscriptions/photo.jpg',
            'cin_recto_path' => 'preinscriptions/cin-recto.jpg',
            'cin_verso_path' => 'preinscriptions/cin-verso.jpg',
            'diplome_attestation_path' => 'preinscriptions/diplome.jpg',
            'releve_bacc_path' => 'preinscriptions/releve.jpg',
            'user_id' => User::factory(),
        ];
    }
}
