<?php

namespace Database\Factories;

use App\Models\ArchiveDossier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ArchiveDossier>
 */
class ArchiveDossierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => 'Promotion '.fake()->year(),
            'date' => fake()->date(),
        ];
    }
}
