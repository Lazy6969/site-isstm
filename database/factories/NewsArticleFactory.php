<?php

namespace Database\Factories;

use App\Models\NewsArticle;
use App\NewsStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NewsArticle>
 */
class NewsArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence();

        return [
            'title' => $title,
            'slug' => str($title)->slug().'-'.fake()->unique()->numberBetween(1, 100000),
            'excerpt' => fake()->sentence(),
            'content' => fake()->paragraphs(3, true),
            'status' => NewsStatus::Publie,
            'published_at' => fake()->dateTimeBetween('-6 months'),
        ];
    }
}
