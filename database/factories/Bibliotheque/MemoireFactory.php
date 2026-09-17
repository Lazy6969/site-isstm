<?php

namespace Database\Factories\Bibliotheque;

use App\MemoireCategorie;
use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Filiere;
use App\Models\Bibliotheque\Memoire;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Memoire>
 */
class MemoireFactory extends Factory
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
            'auteur' => fake()->name(),
            'categorie' => fake()->randomElement(MemoireCategorie::cases()),
            'filiere_id' => Filiere::factory(),
            'annee_id' => AnneeUniversitaire::factory(),
            'chemin_fichier' => 'memoires/'.fake()->uuid().'.pdf',
        ];
    }
}
