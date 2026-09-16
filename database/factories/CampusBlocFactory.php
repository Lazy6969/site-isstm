<?php

namespace Database\Factories;

use App\Models\CampusBloc;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CampusBloc>
 */
class CampusBlocFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bloc_key' => fake()->unique()->lexify('bloc???'),
            'nom' => strtoupper(fake()->unique()->lexify('???')),
            'signification' => fake()->sentence(),
            'images' => [],
        ];
    }
}
