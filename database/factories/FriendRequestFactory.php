<?php

namespace Database\Factories;

use App\FriendRequestStatus;
use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FriendRequest>
 */
class FriendRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sender_id' => User::factory(),
            'recipient_id' => User::factory(),
            'status' => FriendRequestStatus::Pending,
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => FriendRequestStatus::Accepted,
        ]);
    }
}
