<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            HomeContentSeeder::class,
            TeacherSeeder::class,
            CampusBlocSeeder::class,
            NewsSeeder::class,
            GallerySeeder::class,
            PartenaireSeeder::class,
            OrgPersonSeeder::class,
        ]);
    }
}
