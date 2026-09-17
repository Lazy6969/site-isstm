<?php

namespace Database\Factories;

use App\Models\StaffMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StaffMessage>
 */
class StaffMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sender_id' => User::factory()->messagerie(),
            'body' => fake()->sentence(),
        ];
    }
}
