<?php

namespace Database\Factories;

use App\GalleryStatus;
use App\Models\GalleryAlbum;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GalleryAlbum>
 */
class GalleryAlbumFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'title' => $title,
            'slug' => str($title)->slug().'-'.fake()->unique()->numberBetween(1, 100000),
            'status' => GalleryStatus::Publie,
            'event_date' => fake()->date(),
        ];
    }
}
