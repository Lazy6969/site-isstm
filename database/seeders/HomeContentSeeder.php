<?php

namespace Database\Seeders;

use App\Models\Filiere;
use App\Models\HeroSlide;
use App\Models\SiteContent;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class HomeContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedSiteContent();
        $this->seedHeroSlides();
        $this->seedTestimonials();
        $this->seedFilieres();
    }

    private function seedSiteContent(): void
    {
        $entries = [
            'directeur_nom' => ['MANASINA Ruffin', 'MANASINA Ruffin', 'MANASINA Ruffin'],
            'mot_directeur_contenu' => [
                "C'est avec une immense fierté que je vous accueille à l'ISSTM, un lieu où l'excellence académique rencontre l'innovation et la discipline. Notre mission est de former les leaders de demain, des professionnels compétents et des citoyens responsables, prêts à relever les défis de notre temps. Nous nous engageons à vous offrir un environnement d'apprentissage stimulant, soutenu par un corps enseignant dévoué. Rejoignez-nous pour construire ensemble votre avenir.",
                'It is with immense pride that I welcome you to the ISSTM, a place where academic excellence meets innovation and discipline. Our mission is to develop the leaders of tomorrow, competent professionals and responsible citizens, ready to meet the challenges of our time. We are committed to providing you with a challenging learning environment, supported by dedicated faculty. Join us in building your future together.',
                "Amim-pireharehana goavana no handraisako anareo ao amin'ny ISSTM, toerana iray hihaonan'ny manam-pahaizana tsara ny fanavaozana sy ny fitsipi-pifehezana. Ny asa fitoriana dia ny hanana ny mpitarika ny rahampitso, matihanina mahay sy ny tompon'andraikitra olom-pirenena, vonona ny hihaona amin'ny zava-tsarotra amin'izao fotoana izao.",
            ],
            'mission_contenu' => [
                "Former des techniciens et ingénieurs d'élite, dotés de compétences pratiques et d'un esprit d'innovation, capables de contribuer activement au développement technologique et économique de Madagascar.",
                'To train elite technicians and engineers, equipped with practical skills and a spirit of innovation, capable of actively contributing to the technological and economic development of Madagascar.',
                "Mamolavola teknisiana sy injeniera sangany, manana fahaiza-manao azo ampiharina sy saina tia karokaroka, afaka mandray anjara mavitrika amin'ny fampandrosoana ara-teknolojia sy ara-toekaren'i Madagasikara.",
            ],
            'vision_contenu' => [
                "Devenir un pôle d'excellence et une référence nationale et régionale dans l'enseignement supérieur technique et technologique, reconnu pour la qualité de ses diplômés et son impact sur la société.",
                'To become a center of excellence and a national and regional benchmark in technical and technological higher education, recognized for the quality of its graduates and its impact on society.',
                "Ho lasa ivon-toerana sangany sy ohatra nasionaly sy isam-paritra eo amin'ny fampianarana ambony teknika sy teknolojia, ekena noho ny kalitaon'ireo nahazo diplaoma sy ny fiantraikany eo amin'ny fiaraha-monina.",
            ],
            'directeur_image_path' => ['images/directeur.jpg', 'images/directeur.jpg', 'images/directeur.jpg'],
            'mission_image_path' => ['images/mission.jpg', 'images/mission.jpg', 'images/mission.jpg'],
            'vision_image_path' => ['images/vision.jpg', 'images/vision.jpg', 'images/vision.jpg'],
            'logo_image_path' => ['images/logo-isstm.jpg', 'images/logo-isstm.jpg', 'images/logo-isstm.jpg'],
            'stat_students' => ['2500', '2500', '2500'],
            'stat_teachers' => ['73', '73', '73'],
            'stat_majors' => ['18', '18', '18'],
            'contact_email' => ['isstm.univ.umg@gmail.com', 'isstm.univ.umg@gmail.com', 'isstm.univ.umg@gmail.com'],
            'contact_telephone' => ['+261 38 15 439 77', '+261 38 15 439 77', '+261 38 15 439 77'],
            'contact_facebook' => ['https://web.facebook.com/isstm.umg', 'https://web.facebook.com/isstm.umg', 'https://web.facebook.com/isstm.umg'],
            'contact_adresse' => ['Mahajanga, Madagascar', 'Mahajanga, Madagascar', 'Mahajanga, Madagasikara'],
            'contact_adresse_detail' => [
                'Bâtiment Ex-Lolo, en face de Leader Price, Majunga be',
                'Ex-Lolo Building, opposite Leader Price, Majunga be',
                "Trano Ex-Lolo, tandrifin'i Leader Price, Majunga be",
            ],
        ];

        foreach ($entries as $key => [$fr, $en, $mg]) {
            SiteContent::updateOrCreate(
                ['content_key' => $key],
                ['content_value_fr' => $fr, 'content_value_en' => $en, 'content_value_mg' => $mg],
            );
        }
    }

    private function seedHeroSlides(): void
    {
        $slides = [
            ['image_path' => 'images/slide1.jpg', 'display_order' => 1],
            ['image_path' => 'images/slide2.jpg', 'display_order' => 2],
            ['image_path' => 'images/slide3.jpg', 'display_order' => 3],
        ];

        foreach ($slides as $slide) {
            HeroSlide::updateOrCreate(
                ['image_path' => $slide['image_path']],
                ['media_type' => 'image', 'display_order' => $slide['display_order']],
            );
        }
    }

    private function seedTestimonials(): void
    {
        $testimonials = [
            [
                'author_name' => 'Tanael Jaosoa',
                'program' => 'Génie Informatique',
                'image_path' => 'images/etudiant/tanael.jpg',
                'quote_fr' => "L'ISSTM m'a donné les outils pour transformer mes idées en projets concrets. Les enseignants sont de vrais mentors.",
                'quote_en' => 'ISSTM gave me the tools to turn my ideas into concrete projects. The teachers are true mentors.',
                'quote_mg' => 'Ny ISSTM no nanome ahy fitaovana hamadihana ny hevitro ho tetikasa mivaingana. Tena mpanoro hevitra ny mpampianatra.',
                'display_order' => 1,
            ],
            [
                'author_name' => 'Mirindra Ramanana',
                'program' => 'Génie Informatique',
                'image_path' => 'images/etudiant/mirindra.jpeg',
                'quote_fr' => "La formation pratique et les stages en entreprise m'ont permis d'être opérationnelle dès la sortie de l'école.",
                'quote_en' => 'The practical training and internships allowed me to be operational right out of school.',
                'quote_mg' => "Ny fiofanana azo ampiharina sy ny fianarana asa tany amin'ny orinasa no nahatonga ahy ho afaka niasa avy hatrany rehefa nivoaka ny sekoly.",
                'display_order' => 2,
            ],
            [
                'author_name' => 'Safidy Thierry',
                'program' => 'Génie Civil',
                'image_path' => 'images/etudiant/safidy.jpg',
                'quote_fr' => "J'ai pu développer ma créativité et ma rigueur technique grâce à des projets stimulants et un encadrement de qualité.",
                'quote_en' => 'I was able to develop my creativity and technical rigor thanks to stimulating projects and quality supervision.',
                'quote_mg' => 'Afaka nampivelatra ny fahaizako mamorona sy ny fahaizako ara-teknika aho noho ny tetikasa mandrisika sy ny fanaraha-maso kalitao.',
                'display_order' => 3,
            ],
            [
                'author_name' => 'Heather Jameelah',
                'program' => 'Génie Biomédical',
                'image_path' => 'images/etudiant/jameelah.jpg',
                'quote_fr' => "L'ambiance d'entraide et la richesse des cours m'ont poussée à me dépasser. C'est plus qu'une école, c'est une famille.",
                'quote_en' => "The atmosphere of mutual support and the richness of the courses pushed me to surpass myself. It's more than a school, it's a family.",
                'quote_mg' => "Ny rivo-piainana mifampitsimbina sy ny harenan'ny fampianarana no nanosika ahy hihoatra ny tenako. Mihoatra ny sekoly izy io, fianakaviana.",
                'display_order' => 4,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::updateOrCreate(
                ['author_name' => $testimonial['author_name'], 'program' => $testimonial['program']],
                $testimonial,
            );
        }
    }

    private function seedFilieres(): void
    {
        $filieres = [
            [
                'code' => 'GI', 'mention' => 'STNPA', 'niveaux' => 'L1,L2,L3', 'slug' => 'genie-informatique',
                'nom_fr' => 'Génie Informatique', 'nom_en' => 'Computer Engineering', 'nom_mg' => 'Solosaina Engineering',
                'description_fr' => "Formation en développement logiciel, systèmes d'information et technologies web.",
                'description_en' => 'Training in software development, information systems and web technologies.',
                'description_mg' => "Fanofanana amin'ny fampandrosoana ny rindrambaiko, rafitra vaovao sy ny teknolojia web.",
                'image_path' => 'images/logo-isstm.jpg', 'display_order' => 1,
            ],
            [
                'code' => 'GB', 'mention' => 'STNPA', 'niveaux' => 'L2,L3,M1,M2', 'slug' => 'genie-biomedical',
                'nom_fr' => 'Génie Biomédical', 'nom_en' => 'Biomedical Engineering', 'nom_mg' => 'Injeniera Biomedikaly',
                'description_fr' => 'Formation aux technologies médicales, à la maintenance des équipements et à l\'ingénierie de la santé.',
                'description_en' => 'Training in medical technologies, equipment maintenance, and health engineering.',
                'description_mg' => "Fiofanana momba ny teknolojia ara-pitsaboana, fikojakojana fitaovana ary injenieran'ny fahasalamana.",
                'image_path' => 'images/logo-isstm.jpg', 'display_order' => 2,
            ],
            [
                'code' => 'GEI', 'mention' => 'STNPA', 'niveaux' => 'L1,L2,L3', 'slug' => 'genie-electronique-informatique',
                'nom_fr' => 'Génie Électronique et Informatique', 'nom_en' => 'Electronics and Computer Engineering', 'nom_mg' => 'Injeniera Elektronika sy Informatika',
                'description_fr' => 'Formation en électronique embarquée, Internet des Objets (IoT) et systèmes intelligents.',
                'description_en' => 'Training in embedded electronics, Internet of Things (IoT), and intelligent systems.',
                'description_mg' => "Fiofanana momba ny elektronika anaty, Internet an'ny Zavatra (IoT) ary rafitra manan-tsaina.",
                'image_path' => 'images/logo-isstm.jpg', 'display_order' => 3,
            ],
            [
                'code' => 'GE', 'mention' => 'STI', 'niveaux' => 'L1,L2,L3', 'slug' => 'genie-electrique',
                'nom_fr' => 'Génie Électrique', 'nom_en' => 'Electrical Engineering', 'nom_mg' => 'Injeniera Elektrika',
                'description_fr' => "Formation en électrotechnique, automatisme, et gestion de l'énergie électrique.",
                'description_en' => 'Training in electrotechnics, automation, and electrical energy management.',
                'description_mg' => 'Fiofanana momba ny elektroteknika, automatisme ary fitantanana ny angovo elektrika.',
                'image_path' => 'images/logo-isstm.jpg', 'display_order' => 4,
            ],
            [
                'code' => 'GCIVIL', 'mention' => 'STGC', 'niveaux' => 'L1,L2,L3,M1,M2', 'slug' => 'genie-civil',
                'nom_fr' => 'Génie Civil', 'nom_en' => 'Civil Engineering', 'nom_mg' => 'Injeniera Sivily',
                'description_fr' => 'Formation en construction, calcul de structures et utilisation des matériaux de construction.',
                'description_en' => 'Training in construction, structural calculation, and use of construction materials.',
                'description_mg' => 'Fiofanana momba ny fanorenana, fikajiana rafitra ary fampiasana fitaovam-panorenana.',
                'image_path' => 'images/logo-isstm.jpg', 'display_order' => 5,
            ],
        ];

        foreach ($filieres as $filiere) {
            Filiere::updateOrCreate(['slug' => $filiere['slug']], $filiere);
        }
    }
}
