<?php

namespace Database\Factories;

use App\Models\Materiel;
use App\Models\MaterielEmprunt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MaterielEmprunt>
 */
class MaterielEmpruntFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'materiel_id' => Materiel::factory(),
            'emprunteur_nom' => fake()->name(),
            'emprunteur_type' => fake()->randomElement(array_keys(MaterielEmprunt::EMPRUNTEUR_TYPES)),
            'emprunteur_reference' => null,
            'emprunteur_contact' => fake()->phoneNumber(),
            'motif' => 'Cours',
            'date_sortie' => now()->subDays(2)->toDateString(),
            'date_retour_prevue' => now()->addDays(5)->toDateString(),
        ];
    }

    public function enRetard(): static
    {
        return $this->state(fn () => ['date_sortie' => now()->subDays(10)->toDateString(), 'date_retour_prevue' => now()->subDays(3)->toDateString()]);
    }
}
