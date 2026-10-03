<?php

namespace Database\Factories;

use App\Models\ReactivationRequest;
use App\Models\User;
use App\ReactivationStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReactivationRequest>
 */
class ReactivationRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => ReactivationStatus::EnAttente,
        ];
    }
}
