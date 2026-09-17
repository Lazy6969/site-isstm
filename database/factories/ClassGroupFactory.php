<?php

namespace Database\Factories;

use App\ClassGroupType;
use App\Models\ClassGroup;
use App\Models\User;
use App\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ClassGroup>
 */
class ClassGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Groupe '.fake()->word(),
            'type' => ClassGroupType::Classe,
            'annee' => (string) fake()->numberBetween(2024, 2026),
            'niveau' => 'L1',
            'join_code' => strtoupper(Str::random(6)),
            'teacher_id' => User::factory()->role(Role::Enseignant),
        ];
    }
}
