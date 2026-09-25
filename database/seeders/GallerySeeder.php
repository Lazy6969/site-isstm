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
            [
                'title' => 'Réception 2025-2026',
                'slug' => 'reception-2025-2026',
                'description' => "C'est une vrai plaisir de contribuer à cette évènement crucial",
                'cover_image' => 'images/galerie/reception-2025-2026/album_cover_6a7d2ee27e069.jpeg',
                'category' => 'evenements',
                'event_date' => '2026-08-08',
                'location' => 'Saint Gabriel',
                'author' => 'Dr Philibert',
                'status' => 'publie',
                'published_at' => '2026-08-13 05:41:23',
                // No individual captions on the originals (a straight WhatsApp export) —
                // title/alt_text stay null rather than inventing captions that aren't real.
                'photos' => array_map(
                    fn (string $file) => ['image_path' => "images/galerie/reception-2025-2026/{$file}", 'title' => null],
                    self::receptionPhotoFiles(),
                ),
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
                    ['gallery_album_id' => $savedAlbum->id, 'image_path' => $photo['image_path']],
                    ['title' => $photo['title'], 'alt_text' => $photo['title'], 'display_order' => $index + 1],
                );
            }
        }
    }

    /**
     * Filenames of the 135 recovered "Réception 2025-2026" photos, restored
     * from the legacy ISSTM PHP app (github.com/Lazy6969/ISSTM) after they
     * were wiped from this app's own database — see images/galerie/reception-2025-2026.
     *
     * @return array<int, string>
     */
    private static function receptionPhotoFiles(): array
    {
        return [
            'photo_6a808a7b4ac1a_0.jpeg', 'photo_6a808a7b4d12e_1.jpeg', 'photo_6a808a7b4dc28_2.jpeg',
            'photo_6a808a7b4eb63_3.jpeg', 'photo_6a808a7b514b4_4.jpeg', 'photo_6a808a7b51ff3_5.jpeg',
            'photo_6a808a7b52ec2_6.jpeg', 'photo_6a808a7b54cc0_7.jpeg', 'photo_6a808a7b55991_8.jpeg',
            'photo_6a808a7b564a2_9.jpeg', 'photo_6a808a7b56f52_10.jpeg', 'photo_6a80d5311bcc8_0.jpeg',
            'photo_6a80d5311deb0_1.jpeg', 'photo_6a80d5311f314_2.jpeg', 'photo_6a80d53122505_3.jpeg',
            'photo_6a80d531358e8_4.jpeg', 'photo_6a80d5313a8a5_5.jpeg', 'photo_6a80d5313ba0a_6.jpeg',
            'photo_6a80d5313c785_7.jpeg', 'photo_6a80d5313fc20_8.jpeg', 'photo_6a80d53140bea_9.jpeg',
            'photo_6a80d531424d3_10.jpeg', 'photo_6a80d53143189_11.jpeg', 'photo_6a80d5314416d_12.jpeg',
            'photo_6a80d53147465_13.jpeg', 'photo_6a80d53148898_14.jpeg', 'photo_6a80d5314c456_15.jpeg',
            'photo_6a80d5314e0f1_16.jpeg', 'photo_6a80d5314fbd6_17.jpeg', 'photo_6a80d53152076_18.jpeg',
            'photo_6a80d531534b5_19.jpeg', 'photo_6a80d5315435b_20.jpeg', 'photo_6a80d5315507f_21.jpeg',
            'photo_6a80d53157a26_22.jpeg', 'photo_6a80d5315ae3e_23.jpeg', 'photo_6a80d5315bbe8_24.jpeg',
            'photo_6a80d5315ce3d_25.jpeg', 'photo_6a80d5315f2e1_26.jpeg', 'photo_6a80d5315fee9_27.jpeg',
            'photo_6a80d53160f3f_28.jpeg', 'photo_6a80d53163cb2_29.jpeg', 'photo_6a80d53164c0f_30.jpeg',
            'photo_6a80d531671f3_31.jpeg', 'photo_6a80d53168032_32.jpeg', 'photo_6a80d5316c416_33.jpeg',
            'photo_6a80d5316f0f3_34.jpeg', 'photo_6a80d53170006_35.jpeg', 'photo_6a80d53173f74_36.jpeg',
            'photo_6a80d53174b7a_37.jpeg', 'photo_6a80d53176cab_38.jpeg', 'photo_6a80d53178a27_39.jpeg',
            'photo_6a80d531796a6_40.jpeg', 'photo_6a80d5317d283_41.jpeg', 'photo_6a80d5317f710_42.jpeg',
            'photo_6a80d531803b4_43.jpeg', 'photo_6a80d5318172b_44.jpeg', 'photo_6a80d53184735_45.jpeg',
            'photo_6a80d53186231_46.jpeg', 'photo_6a80d53188569_47.jpeg', 'photo_6a80d53189515_48.jpeg',
            'photo_6a80d5318b893_49.jpeg', 'photo_6a80d5318ce24_50.jpeg', 'photo_6a80d5318f010_51.jpeg',
            'photo_6a80d531904f5_52.jpeg', 'photo_6a80d53191b47_53.jpeg', 'photo_6a80d531945d0_54.jpeg',
            'photo_6a80d53195721_55.jpeg', 'photo_6a80d5319772b_56.jpeg', 'photo_6a80d53199ded_57.jpeg',
            'photo_6a80d5319c08c_58.jpeg', 'photo_6a80d5319d35f_59.jpeg', 'photo_6a80d5319e09d_60.jpeg',
            'photo_6a80d531a038b_61.jpeg', 'photo_6a80d53abe292_0.jpeg', 'photo_6a80d53ac05fb_1.jpeg',
            'photo_6a80d53ac1801_2.jpeg', 'photo_6a80d53ac4729_3.jpeg', 'photo_6a80d53ac5ae9_4.jpeg',
            'photo_6a80d53ac8815_5.jpeg', 'photo_6a80d53accbdb_6.jpeg', 'photo_6a80d53acd845_7.jpeg',
            'photo_6a80d53ad357f_8.jpeg', 'photo_6a80d53ad4ebd_9.jpeg', 'photo_6a80d53ad64b3_10.jpeg',
            'photo_6a80d53ad7c26_11.jpeg', 'photo_6a80d53ad93e8_12.jpeg', 'photo_6a80d53ada484_13.jpeg',
            'photo_6a80d53adde27_14.jpeg', 'photo_6a80d53adec62_15.jpeg', 'photo_6a80d53ae0e3c_16.jpeg',
            'photo_6a80d53ae2758_17.jpeg', 'photo_6a80d53ae455f_18.jpeg', 'photo_6a80d53ae5b34_19.jpeg',
            'photo_6a80d53ae68f5_20.jpeg', 'photo_6a80d53ae9011_21.jpeg', 'photo_6a80d53ae9c97_22.jpeg',
            'photo_6a80d53aead10_23.jpeg', 'photo_6a80d53aee72d_24.jpeg', 'photo_6a80d53af10b1_25.jpeg',
            'photo_6a80d53af1ee6_26.jpeg', 'photo_6a80d53af2cb6_27.jpeg', 'photo_6a80d53b00915_28.jpeg',
            'photo_6a80d53b01c99_29.jpeg', 'photo_6a80d53b05017_30.jpeg', 'photo_6a80d53b08724_31.jpeg',
            'photo_6a80d53b09620_32.jpeg', 'photo_6a80d53b0a51c_33.jpeg', 'photo_6a80d53b0b03f_34.jpeg',
            'photo_6a80d53b0cbd8_35.jpeg', 'photo_6a80d53b0dd05_36.jpeg', 'photo_6a80d53b11624_37.jpeg',
            'photo_6a80d53b165e9_38.jpeg', 'photo_6a80d53b18dbc_39.jpeg', 'photo_6a80d53b1a47a_40.jpeg',
            'photo_6a80d53b1b16b_41.jpeg', 'photo_6a80d53b1d391_42.jpeg', 'photo_6a80d53b1e33f_43.jpeg',
            'photo_6a80d53b1f786_44.jpeg', 'photo_6a80d542908d7_0.jpeg', 'photo_6a80d54293765_1.jpeg',
            'photo_6a80d54294318_2.jpeg', 'photo_6a80d54295063_3.jpeg', 'photo_6a80d542987ca_4.jpeg',
            'photo_6a80d5429b53a_5.jpeg', 'photo_6a80d5429c63a_6.jpeg', 'photo_6a80d5429d2c5_7.jpeg',
            'photo_6a80d542a0180_8.jpeg', 'photo_6a80d542a0db0_9.jpeg', 'photo_6a80d542a4009_10.jpeg',
            'photo_6a80d542a5748_11.jpeg', 'photo_6a80d542a78a9_12.jpeg', 'photo_6a80d542a82ed_13.jpeg',
            'photo_6a80d542a91c2_14.jpeg', 'photo_6a80d542ac25c_15.jpeg', 'photo_6a80d542ad0a0_16.jpeg',
        ];
    }
}
