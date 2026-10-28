<?php

namespace Database\Factories;

use App\CommunityDocumentStatus;
use App\Models\CommunityDocument;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityDocument>
 */
class CommunityDocumentFactory extends Factory
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
            'category' => fake()->randomElement(['lecon', 'sujet']),
            'title' => fake()->sentence(3),
            'file_path' => 'storage/lecons-sujets/'.fake()->uuid().'.pdf',
            'status' => CommunityDocumentStatus::EnAttente,
        ];
    }
}
