<?php

namespace Database\Factories;

use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Testimonial>
 */
class TestimonialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'author_name' => fake()->name(),
            'program' => fake()->randomElement(['Génie Informatique', 'Génie Civil', 'Génie Biomédical']),
            'image_path' => 'images/etudiant/tanael.jpg',
            'quote_fr' => fake()->paragraph(),
            'quote_en' => fake()->paragraph(),
            'quote_mg' => fake()->paragraph(),
            'display_order' => fake()->numberBetween(1, 20),
        ];
    }
}
