<?php

namespace Database\Factories;

use App\Models\Teacher;
use App\TeacherCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Teacher>
 */
class TeacherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'category' => fake()->randomElement(TeacherCategory::cases()),
            'specialty_fr' => fake()->jobTitle(),
            'email' => fake()->unique()->safeEmail(),
            'display_order' => fake()->numberBetween(1, 20),
        ];
    }
}
