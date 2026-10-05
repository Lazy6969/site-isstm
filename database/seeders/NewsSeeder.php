<?php

namespace Database\Seeders;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'vie-universitaire', 'name_fr' => 'Vie universitaire', 'icon' => 'fa-building-columns', 'color' => '#1d4ed8', 'display_order' => 1],
            ['slug' => 'vie-etudiante', 'name_fr' => 'Vie étudiante', 'icon' => 'fa-users', 'color' => '#059669', 'display_order' => 2],
            ['slug' => 'education', 'name_fr' => 'Éducation', 'icon' => 'fa-graduation-cap', 'color' => '#7c3aed', 'display_order' => 3],
            ['slug' => 'formation', 'name_fr' => 'Formation', 'icon' => 'fa-chalkboard-teacher', 'color' => '#ea580c', 'display_order' => 4],
            ['slug' => 'recherche', 'name_fr' => 'Recherche', 'icon' => 'fa-flask', 'color' => '#0891b2', 'display_order' => 5],
            ['slug' => 'evenements', 'name_fr' => 'Événements', 'icon' => 'fa-calendar-days', 'color' => '#db2777', 'display_order' => 6],
            ['slug' => 'conferences', 'name_fr' => 'Conférences', 'icon' => 'fa-microphone-lines', 'color' => '#ca8a04', 'display_order' => 7],
            ['slug' => 'concours', 'name_fr' => 'Concours', 'icon' => 'fa-trophy', 'color' => '#dc2626', 'display_order' => 8],
            ['slug' => 'sports', 'name_fr' => 'Sports', 'icon' => 'fa-futbol', 'color' => '#16a34a', 'display_order' => 9],
            ['slug' => 'culture', 'name_fr' => 'Culture', 'icon' => 'fa-masks-theater', 'color' => '#9333ea', 'display_order' => 10],
            ['slug' => 'partenariats', 'name_fr' => 'Partenariats', 'icon' => 'fa-handshake', 'color' => '#0d9488', 'display_order' => 11],
            ['slug' => 'communiques', 'name_fr' => 'Communiqués', 'icon' => 'fa-bullhorn', 'color' => '#4f46e5', 'display_order' => 12],
            ['slug' => 'annonces', 'name_fr' => 'Annonces', 'icon' => 'fa-thumbtack', 'color' => '#c2410c', 'display_order' => 13],
            ['slug' => 'administration', 'name_fr' => 'Administration', 'icon' => 'fa-building', 'color' => '#475569', 'display_order' => 14],
            ['slug' => 'opportunites', 'name_fr' => 'Opportunités', 'icon' => 'fa-lightbulb', 'color' => '#d4a017', 'display_order' => 15],
        ];

        foreach ($categories as $category) {
            NewsCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }

        $articles = [
            [
                'title' => "Ouverture des inscriptions pour l'année académique 2026-2027",
                'slug' => 'ouverture-inscriptions-2026-2027',
                'excerpt' => 'Les inscriptions pour la nouvelle année académique sont désormais ouvertes pour tous les niveaux, de la Licence 1 au Master 2.',
                'content' => "L'ISSTM a le plaisir d'annoncer l'ouverture des inscriptions pour l'année académique 2026-2027. Les candidats intéressés peuvent déposer leur dossier auprès du service de scolarité à partir du 1er septembre.\n\nLes pièces à fournir ainsi que les frais d'inscription sont disponibles sur la page Formulaire d'inscription du site. Pour toute question, le service de scolarité reste à votre disposition du lundi au vendredi.",
                'image_path' => 'images/slide1.jpg',
                'category' => 'annonces',
                'author' => 'Service Communication ISSTM',
                'status' => 'publie',
                'is_featured' => true,
                'views' => 22,
                'published_at' => '2026-08-01 09:00:00',
            ],
            [
                'title' => 'Tournoi sportif inter-mentions : les résultats',
                'slug' => 'tournoi-sportif-inter-mentions-resultats',
                'excerpt' => "Retour sur le tournoi de football qui a rassemblé les étudiants des différentes mentions autour d'une compétition amicale.",
                'content' => "Le tournoi sportif inter-mentions organisé par le club sportif étudiant s'est déroulé dans une ambiance conviviale. Les équipes de Génie Informatique et de Génie Civil se sont affrontées en finale.\n\nFélicitations à tous les participants pour leur esprit sportif et leur engagement.",
                'image_path' => 'images/portal_assoc_4.jpg',
                'category' => 'sports',
                'author' => 'Club Sportif ISSTM',
                'status' => 'publie',
                'is_featured' => false,
                'views' => 7,
                'published_at' => '2026-03-12 14:00:00',
            ],
            [
                'title' => "Conférence sur l'innovation numérique à Madagascar",
                'slug' => 'conference-innovation-numerique-madagascar',
                'excerpt' => 'Des professionnels du secteur numérique malgache sont venus échanger avec nos étudiants en Génie Informatique.',
                'content' => "Dans le cadre du renforcement des liens entre le monde académique et professionnel, l'ISSTM a organisé une conférence-débat sur l'innovation numérique à Madagascar.\n\nLes intervenants ont partagé leur expérience et répondu aux questions des étudiants sur les opportunités du secteur.",
                'image_path' => 'images/portal_assoc_5.jpg',
                'category' => 'conferences',
                'author' => 'Département Génie Informatique',
                'status' => 'publie',
                'is_featured' => false,
                'views' => 7,
                'published_at' => '2026-05-16 10:00:00',
            ],
            [
                'title' => "Appel à candidatures : bourses d'études 2026",
                'slug' => 'appel-candidatures-bourses-2026',
                'excerpt' => "Les étudiants méritants peuvent désormais déposer leur candidature pour les bourses d'études de l'année en cours.",
                'content' => "L'ISSTM lance un appel à candidatures pour l'attribution des bourses d'études au titre de l'année 2026. Les critères d'éligibilité ainsi que les documents requis sont détaillés sur la page Bourse du site.\n\nLa date limite de dépôt des dossiers est fixée au 30 septembre.",
                'image_path' => 'images/portal_assoc_6.jpg',
                'category' => 'opportunites',
                'author' => 'Service des Affaires Estudiantines',
                'status' => 'publie',
                'is_featured' => false,
                'views' => 11,
                'published_at' => '2026-07-20 08:30:00',
            ],
            [
                'title' => "Signature d'un partenariat avec une entreprise du secteur numérique",
                'slug' => 'signature-partenariat-entreprise-numerique',
                'excerpt' => "Un nouveau partenariat a été signé afin de faciliter les stages et l'insertion professionnelle de nos étudiants.",
                'content' => "L'ISSTM renforce ses liens avec le monde professionnel à travers la signature d'une convention de partenariat avec une entreprise locale du secteur numérique. Cette collaboration permettra à nos étudiants d'accéder à des offres de stage et d'emploi.",
                'image_path' => 'images/slide2.jpg',
                'category' => 'partenariats',
                'author' => 'Direction ISSTM',
                'status' => 'publie',
                'is_featured' => false,
                'views' => 3,
                'published_at' => '2025-11-05 11:00:00',
            ],
            [
                'title' => "Journée culturelle de l'ISSTM 2026 (brouillon)",
                'slug' => 'journee-culturelle-isstm-2026',
                'excerpt' => 'Préparatifs en cours pour la journée culturelle annuelle.',
                'content' => 'Article en cours de rédaction sur la journée culturelle à venir.',
                'image_path' => 'images/slide3.jpg',
                'category' => 'culture',
                'author' => 'Service Communication ISSTM',
                'status' => 'brouillon',
                'is_featured' => false,
                'views' => 1,
                'published_at' => null,
            ],
            [
                'title' => 'Sortant 2025',
                'slug' => 'sortant-2025',
                'excerpt' => '109 Étudiants sont sortis lors de cet évènement mémorable',
                'content' => 'Test articles',
                'image_path' => null,
                'category' => 'evenements',
                'author' => 'Dr Philibert',
                'status' => 'publie',
                'is_featured' => false,
                'views' => 11,
                'published_at' => '2025-11-11 01:29:00',
            ],
        ];

        foreach ($articles as $article) {
            $categoryId = NewsCategory::where('slug', $article['category'])->value('id');
            unset($article['category']);
            $article['news_category_id'] = $categoryId;

            NewsArticle::updateOrCreate(['slug' => $article['slug']], $article);
        }
    }
}
