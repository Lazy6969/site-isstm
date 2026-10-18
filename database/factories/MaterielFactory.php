<?php

namespace Database\Factories;

use App\MaterielStatut;
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
            'code' => 'MAT-'.fake()->unique()->numerify('####-#####'),
            'nom' => fake()->randomElement(['Ordinateur portable', 'Vidéoprojecteur', 'Imprimante', 'Table de laboratoire', 'Routeur']),
            'categorie' => fake()->randomElement(array_keys(Materiel::CATEGORIES)),
            'marque' => fake()->randomElement(['HP', 'Dell', 'Epson', 'Lenovo']),
            'modele' => strtoupper(fake()->bothify('??-###')),
            'numero_serie' => strtoupper(fake()->bothify('SN#########')),
            'statut' => MaterielStatut::Disponible,
            'localisation' => fake()->randomElement(['Salle 1', 'Salle 2', 'Magasin', 'Bureau scolarité']),
            'date_acquisition' => now()->subMonths(fake()->numberBetween(1, 48))->toDateString(),
            'valeur' => fake()->randomElement([150000, 450000, 1200000]),
        ];
    }

    public function statut(MaterielStatut $statut): static
    {
        return $this->state(fn () => ['statut' => $statut]);
    }
}
