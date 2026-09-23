<?php

namespace Database\Factories;

use App\Models\OrgPerson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrgPerson>
 */
class OrgPersonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title_key' => fake()->unique()->slug(2),
            'name' => fake()->name(),
            'photo_path' => 'images/organigramme/directeur.jpg',
            'sort_order' => fake()->numberBetween(1, 39),
        ];
    }
}
