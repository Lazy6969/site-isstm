<?php

namespace Database\Factories;

use App\Models\AccessKey;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AccessKey>
 */
class AccessKeyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'role' => fake()->unique()->randomElement(array_values(AccessKey::DEPARTMENTS)),
            'key_hash' => null,
            'is_active' => false,
        ];
    }
}
