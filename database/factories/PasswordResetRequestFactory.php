<?php

namespace Database\Factories;

use App\Models\PasswordResetRequest;
use App\Models\User;
use App\PasswordResetRequestStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PasswordResetRequest>
 */
class PasswordResetRequestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => PasswordResetRequestStatus::EnAttente,
        ];
    }

    public function accepte(): static
    {
        return $this->state(fn () => ['status' => PasswordResetRequestStatus::Accepte, 'handled_at' => now()]);
    }

    public function refuse(): static
    {
        return $this->state(fn () => ['status' => PasswordResetRequestStatus::Refuse, 'handled_at' => now()]);
    }
}
