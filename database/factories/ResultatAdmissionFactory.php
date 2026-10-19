<?php

namespace Database\Factories;

use App\Models\ArchiveDossier;
use App\Models\Filiere;
use App\Models\ResultatAdmission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResultatAdmission>
 */
class ResultatAdmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => strtoupper(fake()->lastName()),
            'prenoms' => fake()->firstName(),
            'niveau' => fake()->randomElement(['L1', 'L2', 'L3', 'M1', 'M2']),
            'filiere_id' => Filiere::factory(),
            'date' => fake()->date(),
        ];
    }

    /** Files this résultat under a freshly created dossier, unless one is
     * passed in — pass an existing ArchiveDossier to group several together. */
    public function archived(?ArchiveDossier $dossier = null): static
    {
        return $this->state(fn () => ['archive_dossier_id' => ($dossier ?? ArchiveDossier::factory()->create())->id]);
    }
}
