<?php

namespace Database\Factories;

use App\GroupMemberRole;
use App\Models\ClassGroup;
use App\Models\ClassGroupMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClassGroupMember>
 */
class ClassGroupMemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'class_group_id' => ClassGroup::factory(),
            'user_id' => User::factory(),
            'role_in_group' => GroupMemberRole::Etudiant,
            'is_banned' => false,
            'is_delegate' => false,
            'joined_at' => now(),
            'last_read_at' => null,
        ];
    }
}
