<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\User;
use App\Role;
use App\StatutEtudiant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Etudiant>
 */
class EtudiantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->role(Role::Etudiant),
            'preinscription_id' => null,
            'classe_id' => Classe::factory(),
            'matricule' => strtoupper(fake()->unique()->bothify('ISSTM-####-???')),
            'statut' => StatutEtudiant::Actif,
        ];
    }
}
