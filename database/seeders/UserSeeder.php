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
     * Dev-only accounts, local database. Change these passwords before any shared/production use.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@isstm.test'],
            [
                'name' => 'Administrateur ISSTM',
                'password' => Hash::make('IsstmAdmin2026!'),
                'role' => Role::Admin,
                'email_verified_at' => now(),
            ],
        );

        $admin->syncRoles([Role::Admin->spatieRole()]);

        // Scolarité has no legacy Role counterpart — its access is driven
        // entirely by the Spatie 'scolarite' role (see RoleHome::for()).
        $scolarite = User::updateOrCreate(
            ['email' => 'scolarite@isstm.test'],
            [
                'name' => 'Scolarité ISSTM',
                'password' => Hash::make('scolarite2026!'),
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
        $scolarite->syncRoles(['scolarite']);

        $enseignant = User::updateOrCreate(
            ['email' => 'enseignant@isstm.test'],
            [
                'name' => 'Enseignant ISSTM',
                'password' => Hash::make('enseignant2026!'),
                'role' => Role::Enseignant,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
        $enseignant->syncRoles([Role::Enseignant->spatieRole()]);

        $materiel = User::updateOrCreate(
            ['email' => 'materiel@isstm.test'],
            [
                'name' => 'Responsable Matériel ISSTM',
                'password' => Hash::make('materiel2026!'),
                'role' => Role::Materiel,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
        $materiel->syncRoles([Role::Materiel->spatieRole()]);
    }
}
