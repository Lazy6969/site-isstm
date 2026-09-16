<?php

namespace Database\Seeders;

use App\Models\User;
use App\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Dev-only account, local database. Change this password before any shared/production use.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@isstm.test'],
            [
                'name' => 'Administrateur ISSTM',
                'password' => Hash::make('IsstmAdmin2026!'),
                'role' => Role::Admin,
                'email_verified_at' => now(),
            ],
        );
    }
}
