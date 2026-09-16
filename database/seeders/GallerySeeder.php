<?php

namespace Database\Seeders;

use App\Models\GalleryAlbum;
use App\Models\GalleryCategory;
use App\Models\GalleryPhoto;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'vie-academique', 'name_fr' => 'Vie académique', 'icon' => 'fa-graduation-cap', 'display_order' => 1],
            ['slug' => 'evenements', 'name_fr' => 'Événements', 'icon' => 'fa-calendar-days', 'display_order' => 2],
            ['slug' => 'vie-etudiante', 'name_fr' => 'Vie étudiante', 'icon' => 'fa-users', 'display_order' => 3],
            ['slug' => 'campus', 'name_fr' => 'Campus & infrastructures', 'icon' => 'fa-building-columns', 'display_order' => 4],
            ['slug' => 'enseignants-admin', 'name_fr' => 'Enseignants & administration', 'icon' => 'fa-chalkboard-user', 'display_order' => 5],
            ['slug' => 'partenariats', 'name_fr' => 'Partenariats', 'icon' => 'fa-handshake', 'display_order' => 6],
            ['slug' => 'sports', 'name_fr' => 'Sports', 'icon' => 'fa-futbol', 'display_order' => 7],
            ['slug' => 'ceremonies', 'name_fr' => 'Cérémonies', 'icon' => 'fa-award', 'display_order' => 8],
            ['slug' => 'conferences', 'name_fr' => 'Conférences', 'icon' => 'fa-microphone-lines', 'display_order' => 9],
            ['slug' => 'sorties-voyages', 'name_fr' => 'Sorties / voyages', 'icon' => 'fa-plane-departure', 'display_order' => 10],
        ];

        foreach ($categories as $category) {
            GalleryCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }

        $albums = [
            [
                'title' => 'Rentrée universitaire 2025-2026',
                'slug' => 'rentree-universitaire-2025-2026',
                'description' => "Cérémonie officielle de rentrée universitaire à l'ISSTM, en présence des enseignants, du personnel administratif et des nouveaux étudiants.",
                'cover_image' => 'images/slide1.jpg',
                'category' => 'evenements',
                'event_date' => '2025-09-15',
                'location' => 'Campus ISSTM, Mahajanga',
                'author' => 'Service Communication ISSTM',
                'status' => 'publie',
                'published_at' => '2026-08-07 23:53:54',
                'photos' => [
                    ['image_path' => 'images/slide1.jpg', 'title' => "Entrée de l'ISSTM décorée"],
                    ['image_path' => 'images/slide2.jpg', 'title' => 'Allocution du Directeur'],
                    ['image_path' => 'images/portal_assoc_4.jpg', 'title' => 'Étudiants pendant la cérémonie'],
                ],
            ],
            [
                'title' => 'Tournoi de football inter-mentions',
                'slug' => 'tournoi-football-inter-mentions',
                'description' => "Match amical annuel entre les différentes mentions de l'ISSTM, organisé par le club sportif étudiant.",
                'cover_image' => 'images/portal_assoc_4.jpg',
                'category' => 'sports',
                'event_date' => '2025-03-10',
                'location' => "Terrain de sport de l'ISSTM",
                'author' => 'Club Sportif ISSTM',
                'status' => 'publie',
                'published_at' => '2026-08-07 23:53:54',
                'photos' => [
                    ['image_path' => 'images/portal_assoc_4.jpg', 'title' => "Coup d'envoi du match"],
                    ['image_path' => 'images/portal_assoc_5.jpg', 'title' => 'Ambiance dans les gradins'],
                ],
            ],
            [
                'title' => 'Vie sur le campus',
                'slug' => 'vie-sur-le-campus',
                'description' => "Moments capturés au quotidien sur le campus de l'ISSTM : bâtiments, espaces verts et vie étudiante.",
                'cover_image' => 'images/portal_assoc_6.jpg',
                'category' => 'campus',
                'event_date' => '2024-09-01',
                'location' => 'Campus ISSTM, Mahajanga',
                'author' => 'Service Communication ISSTM',
                'status' => 'publie',
                'published_at' => '2026-08-07 23:53:54',
                'photos' => [
                    ['image_path' => 'images/slide2.jpg', 'title' => "Bâtiments de l'ISSTM"],
                    ['image_path' => 'images/slide3.jpg', 'title' => 'Logo ISSTM sur le bâtiment'],
                    ['image_path' => 'images/portal_assoc_6.jpg', 'title' => 'Ambiance sur le campus'],
                ],
            ],
            [
                'title' => "Conférence sur l'innovation numérique",
                'slug' => 'conference-innovation-numerique',
                'description' => 'Conférence-débat avec des professionnels du secteur numérique malgache, organisée pour les étudiants en Génie Informatique.',
                'cover_image' => 'images/portal_assoc_5.jpg',
                'category' => 'conferences',
                'event_date' => '2025-05-15',
                'location' => 'Amphithéâtre ISSTM',
                'author' => 'Département Génie Informatique',
                'status' => 'publie',
                'published_at' => '2026-08-07 23:53:54',
                'photos' => [
                    ['image_path' => 'images/portal_assoc_5.jpg', 'title' => 'Intervenant en pleine présentation'],
                ],
            ],
        ];

        foreach ($albums as $album) {
            $categoryId = GalleryCategory::where('slug', $album['category'])->value('id');
            $photos = $album['photos'];
            unset($album['category'], $album['photos']);
            $album['gallery_category_id'] = $categoryId;

            $savedAlbum = GalleryAlbum::updateOrCreate(['slug' => $album['slug']], $album);

            foreach ($photos as $index => $photo) {
                GalleryPhoto::updateOrCreate(
                    ['gallery_album_id' => $savedAlbum->id, 'image_path' => $photo['image_path'], 'title' => $photo['title']],
                    ['alt_text' => $photo['title'], 'display_order' => $index + 1],
                );
            }
        }
    }
}
