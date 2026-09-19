<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Inscription;
use App\StatutInscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inscription>
 */
class InscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'etudiant_id' => Etudiant::factory(),
            'classe_id' => Classe::factory(),
            'annee' => (string) fake()->numberBetween(2024, 2026),
            'numero' => strtoupper(fake()->unique()->bothify('INS-####')),
            'statut' => StatutInscription::EnAttente,
            'date_inscription' => fake()->date(),
        ];
    }
}
