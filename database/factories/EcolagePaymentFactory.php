<?php

namespace Database\Factories;

use App\EcolageStatus;
use App\Models\EcolagePayment;
use App\Models\Etudiant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EcolagePayment>
 */
class EcolagePaymentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'etudiant_id' => Etudiant::factory(),
            'annee_universitaire' => EcolagePayment::currentAcademicYear(),
            'type' => fake()->randomElement(array_keys(EcolagePayment::TYPES)),
            'mode' => fake()->randomElement(array_keys(EcolagePayment::MODES)),
            'amount' => fake()->randomElement([250000, 550000, 750000]),
            'reference' => strtoupper(fake()->unique()->bothify('REF-########')),
            'paid_at' => now()->subDays(fake()->numberBetween(0, 20))->toDateString(),
            'receipt_path' => 'ecolage/receipts/'.fake()->uuid().'.jpg',
            'card_path' => 'ecolage/cards/'.fake()->uuid().'.jpg',
            'status' => EcolageStatus::EnAttente,
        ];
    }

    public function validated(): static
    {
        return $this->state(fn () => ['status' => EcolageStatus::Valide, 'reviewed_at' => now()]);
    }

    public function refused(): static
    {
        return $this->state(fn () => ['status' => EcolageStatus::Refuse, 'reviewed_at' => now(), 'motif_refus' => 'Reçu illisible.']);
    }
}
