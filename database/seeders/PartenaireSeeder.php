<?php

namespace Database\Seeders;

use App\Models\Partenaire;
use Illuminate\Database\Seeder;

class PartenaireSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $partenaires = [
            ['nom' => 'Université de Laval', 'logo_path' => 'images/partenariat/laval.png', 'site_url' => 'https://www.ulaval.ca/', 'display_order' => 1],
            ['nom' => "Département de physique de l'Université d'Antananarivo", 'logo_path' => 'images/partenariat/universite-antananarivo.jpg', 'site_url' => 'https://univ-antananarivo.mg/', 'display_order' => 2],
            ['nom' => "Département de physique de l'Université d'Antsiranana", 'logo_path' => 'images/partenariat/universite-antsiranana.png', 'site_url' => 'https://univants.mg/', 'display_order' => 3],
            ['nom' => 'Département de physique de l\'Université de Fianarantsoa', 'logo_path' => 'images/partenariat/universite-fianarantsoa.png', 'site_url' => 'https://www.univ-fianarantsoa.mg/', 'display_order' => 4],
            ['nom' => "Département de physique de l'Université de Tuléar", 'logo_path' => 'images/partenariat/universite-tulear.jpg', 'site_url' => 'https://www.univ-toliara.mg/', 'display_order' => 5],
            ['nom' => "Institut pour la maîtrise de l'Energie", 'logo_path' => 'images/partenariat/institut-energie.png', 'site_url' => 'https://www.univ-antananarivo.mg/institut-pour-la-maitrise-de-l-energie', 'display_order' => 6],
            ['nom' => 'Centre Don Bosco Mahajanga', 'logo_path' => 'images/partenariat/don-bosco.png', 'site_url' => 'https://evbb.eu/members/centre-de-formation-professionnelle-don-bosco-antanimasaja-mahajanga/', 'display_order' => 7],
            ['nom' => 'Chambre de Commerce International de Mahajanga', 'logo_path' => 'images/partenariat/chambre-commerce.png', 'site_url' => 'https://cpccaf.org/cci-de-mahajanga/', 'display_order' => 8],
            ['nom' => 'Université de Mahajanga', 'logo_path' => 'images/partenariat/universite-mahajanga.png', 'site_url' => 'https://www.mahajanga-univ.mg/', 'display_order' => 9],
            ['nom' => 'Direction Générale du Trésor', 'logo_path' => 'images/partenariat/tresor-public.png', 'site_url' => 'http://www.tresorpublic.mg/', 'display_order' => 10],
            ['nom' => 'INRIA Lille France', 'logo_path' => 'images/partenariat/inria-lille.png', 'site_url' => 'https://www.inria.fr/fr', 'display_order' => 11],
        ];

        foreach ($partenaires as $partenaire) {
            Partenaire::updateOrCreate(['nom' => $partenaire['nom']], $partenaire);
        }
    }
}
