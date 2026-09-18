<?php

namespace Database\Factories;

use App\Models\SiteContent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiteContent>
 */
class SiteContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_key' => fake()->unique()->slug(2),
            'content_value_fr' => fake()->sentence(),
            'content_value_en' => fake()->sentence(),
            'content_value_mg' => fake()->sentence(),
        ];
    }
}
