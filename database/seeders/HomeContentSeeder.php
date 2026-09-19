<?php

namespace Database\Seeders;

use App\Models\Filiere;
use App\Models\HeroSlide;
use App\Models\SiteContent;
use App\Models\Testimonial;
use App\SiteContentType;
use App\SiteIcon;
use Illuminate\Database\Seeder;

class HomeContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedSiteContent();
        $this->seedIcons();
        $this->seedHeroSlides();
        $this->seedTestimonials();
        $this->seedFilieres();
    }

    /**
     * Icon choices behind the quick-edit icon picker — one value shared across
     * locales (see SiteContent::updateForCurrentLocale()), not a translation.
     */
    private function seedIcons(): void
    {
        $icons = [
            'contact_email_icon' => SiteIcon::Mail,
            'contact_telephone_icon' => SiteIcon::Phone,
            'contact_adresse_icon' => SiteIcon::MapPin,
            'contact_facebook_icon' => SiteIcon::Link2,
            'stat_students_icon' => SiteIcon::GraduationCap,
            'stat_teachers_icon' => SiteIcon::Users,
            'stat_majors_icon' => SiteIcon::Compass,
        ];

        foreach ($icons as $key => $icon) {
            SiteContent::updateOrCreate(
                ['content_key' => $key],
                [
                    'type' => SiteContentType::Icon,
                    'content_value_fr' => $icon->value,
                    'content_value_en' => $icon->value,
                    'content_value_mg' => $icon->value,
                ],
            );
        }
    }

    private function seedSiteContent(): void
    {
        $entries = [
            'directeur_nom' => ['Professeur MANASINA Ruffin', 'Professor MANASINA Ruffin', 'Profesora MANASINA Ruffin'],
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
            'inscription_annee_universitaire' => ['2026', '2026', '2026'],
            'inscription_date_limite' => ['2026-10-09', '2026-10-09', '2026-10-09'],
            'inscription_adresse_bloc' => [
                "Mme le Chef de Service de la Scolarité Centrale\nUniversité de Mahajanga, BP 652, Mahajanga (401)\nTél : 034 44 889 86",
                "Mme le Chef de Service de la Scolarité Centrale\nUniversité de Mahajanga, BP 652, Mahajanga (401)\nTél : 034 44 889 86",
                "Mme le Chef de Service de la Scolarité Centrale\nUniversité de Mahajanga, BP 652, Mahajanga (401)\nTél : 034 44 889 86",
            ],
            'inscription_compte_bancaire' => ['00650 05004012981-07', '00650 05004012981-07', '00650 05004012981-07'],
            'frais_nat_lic_droit' => ['750 000 Ar', '750 000 Ar', '750 000 Ar'],
            'frais_nat_lic_v1' => ['250 000 Ar', '250 000 Ar', '250 000 Ar'],
            'frais_nat_lic_v2' => ['250 000 Ar', '250 000 Ar', '250 000 Ar'],
            'frais_nat_lic_v3' => ['250 000 Ar', '250 000 Ar', '250 000 Ar'],
            'frais_nat_mas_droit' => ['1 050 000 Ar', '1 050 000 Ar', '1 050 000 Ar'],
            'frais_nat_mas_v1' => ['550 000 Ar', '550 000 Ar', '550 000 Ar'],
            'frais_nat_mas_v2' => ['250 000 Ar', '250 000 Ar', '250 000 Ar'],
            'frais_nat_mas_v3' => ['250 000 Ar', '250 000 Ar', '250 000 Ar'],
            'frais_nat_tenue' => ['20 000 Ar', '20 000 Ar', '20 000 Ar'],
            'frais_etr_lic_droit' => ['1 050 000 Ar', '1 050 000 Ar', '1 050 000 Ar'],
            'frais_etr_lic_v1' => ['350 000 Ar', '350 000 Ar', '350 000 Ar'],
            'frais_etr_lic_v2' => ['350 000 Ar', '350 000 Ar', '350 000 Ar'],
            'frais_etr_lic_v3' => ['350 000 Ar', '350 000 Ar', '350 000 Ar'],
            'frais_etr_mas_droit' => ['1 500 000 Ar', '1 500 000 Ar', '1 500 000 Ar'],
            'frais_etr_mas_v1' => ['750 000 Ar', '750 000 Ar', '750 000 Ar'],
            'frais_etr_mas_v2' => ['375 000 Ar', '375 000 Ar', '375 000 Ar'],
            'frais_etr_mas_v3' => ['375 000 Ar', '375 000 Ar', '375 000 Ar'],
            'frais_etr_tenue' => ['20 000 Ar', '20 000 Ar', '20 000 Ar'],
            'localisation_principale' => ['Campus Principal', 'Main Campus', 'Tobim-pianarana Lehibe'],
            'localisation_annexe_titre' => [
                'Bâtiment Ex-Lolo, en face de Leader Price, Majunga be',
                'Ex-Lolo Building, opposite Leader Price, Majunga be',
                "Trano Ex-Lolo, tandrifin'i Leader Price, Majunga be",
            ],
            'histoire_titre' => ['Notre Histoire', 'Our History', 'Ny Tantara'],
            'histoire_soustitre' => [
                "Découvrez la genèse et l'évolution de l'ISSTM.",
                'Discover the genesis and evolution of ISSTM.',
                "Fantaro ny niandohany sy ny fivoaran'ny ISSTM.",
            ],
            'creation_contexte' => ['Création et Contexte', 'Creation and Context', 'Fananganana sy ny manodidina'],
            'creation_p1' => [
                "Depuis la création du Centre Universitaire de Mahajanga en 1977, puis l'instauration des six Universités de Madagascar en 1988, l'évolution de l'offre de formation est restée relativement limitée. Toutefois, à partir de l'année universitaire 2010-2011, une diversification notable des formations a été engagée au sein de l'Université de Mahajanga.",
                'Since the creation of the University Center of Mahajanga in 1977, then the establishment of the six Universities of Madagascar in 1988, the evolution of the training offer has remained relatively limited. However, from the 2010-2011 academic year, a notable diversification of training was initiated within the University of Mahajanga.',
                "Hatramin'ny nananganana ny Foibem-pianarana Oniversitera an'i Mahajanga tamin'ny 1977, ary avy eo ny nanorenana ireo Oniversite enina eto Madagasikara tamin'ny 1988, dia somary voafetra ihany ny fivoaran'ny tolotra fiofanana. Na izany aza, nanomboka tamin'ny taom-pianarana 2010-2011, dia nisy fanitarana lehibe teo amin'ny sehatry ny fiofanana teo anivon'ny Oniversiten'i Mahajanga.",
            ],
            'creation_p2' => [
                "C'est dans ce contexte qu'a été créé, au cours de l'année universitaire 2011-2012, l'Institut Supérieur des Sciences et Technologies de Mahajanga (ISSTM). Cet institut figure parmi les nouveaux centres de formation dédiés à la préparation de techniciens supérieurs hautement qualifiés.",
                'It is in this context that the Higher Institute of Science and Technology of Mahajanga (ISSTM) was created during the 2011-2012 academic year. This institute is one of the new training centers dedicated to the preparation of highly qualified senior technicians.',
                "Tao anatin'izany no nananganana ny Institut Supérieur des Sciences et Technologies de Mahajanga (ISSTM) nandritra ny taom-pianarana 2011-2012. Ity institiota ity dia anisan'ireo foibem-piofanana vaovao natokana hanomanana teknisiana ambony manana fahaizana avo.",
            ],
            'objectifs_majeurs' => ['Nos Objectifs Majeurs', 'Our Major Objectives', 'Ny Tanjonay Lehibe'],
            'objectifs_p1' => [
                "La mise en place de l'ISSTM répond à plusieurs enjeux majeurs, notamment :",
                'The establishment of ISSTM responds to several major challenges, including:',
                'Ny fananganana ny ISSTM dia mamaly fanamby lehibe maromaro, indrindra indrindra :',
            ],
            'objectif_1' => [
                'Les exigences du développement économique régional.',
                'The requirements of regional economic development.',
                "Ny fitakian'ny fampandrosoana ara-toekarena isam-paritra.",
            ],
            'objectif_2' => [
                'Le manque de cadres techniques intermédiaires au sein des entreprises et des collectivités territoriales décentralisées.',
                'The lack of intermediate technical managers within companies and decentralized local authorities.',
                "Ny tsy fahampian'ny mpiandraikitra teknika anelanelany eo anivon'ny orinasa sy ny vondrom-bahoaka itsinjaram-pahefana.",
            ],
            'objectif_3' => [
                "La volonté de réduire les charges financières des familles contraintes d'envoyer leurs enfants poursuivre leurs études en dehors de la province de Mahajanga.",
                'The desire to reduce the financial burdens of families forced to send their children to study outside the province of Mahajanga.',
                "Ny finiavana hampihena ny fandaniana ara-bolan'ireo fianakaviana voatery mandefa ny zanany hanohy fianarana any ivelan'ny faritanin'i Mahajanga.",
            ],
            'statut_pedagogie' => ['Statut et Pédagogie', 'Status and Pedagogy', 'Sata sy Fampianarana'],
            'statut_p1' => [
                "À l'issue de leur formation, les diplômés de l'ISSTM sont directement opérationnels dans divers domaines. Par ailleurs, l'ISSTM a acquis le statut d'établissement à part entière, au même titre que l'IOSTM, la Faculté de Médecine et la FSTE, conformément au décret n°2017-418 du 06 juin 2017.",
                'At the end of their training, ISSTM graduates are directly operational in various fields. In addition, ISSTM has acquired the status of a full-fledged establishment, in the same way as IOSTM, the Faculty of Medicine and the FSTE, in accordance with Decree No. 2017-418 of June 6, 2017.',
                "Rehefa vita ny fiofanany, dia afaka miasa avy hatrany amin'ny sehatra isan-karazany ireo nahazo diplaoma tao amin'ny ISSTM. Ankoatra izany, ny ISSTM dia nahazo ny satan'ny sekoly feno, mitovy amin'ny IOSTM, ny Faculté de Médecine ary ny FSTE, araka ny didim-panjakana laharana faha-2017-418 tamin'ny 06 jona 2017.",
            ],
            'statut_p2' => [
                "Les formations dispensées, à caractère scientifique et technique, sont renforcées par une immersion dans le milieu professionnel à travers des visites d'imprégnation, des stages en entreprise ainsi que l'intervention de professionnels spécialisés.",
                'The training provided, of a scientific and technical nature, is reinforced by an immersion in the professional environment through impregnation visits, company internships as well as the intervention of specialized professionals.',
                "Ny fiofanana omena, izay manana endrika siantifika sy teknika, dia hamafisina amin'ny alalan'ny fampidirana an-tsehatra eo amin'ny tontolon'ny asa amin'ny alalan'ny fitsidihana, ny fanaovana fampiharana an-trano asa ary ny fandraisan'anjaran'ireo matihanina manokana.",
            ],
            'offre_formation' => ['Offre de Formation (LMD)', 'Training Offer (LMD)', 'Tolotra Fiofanana (LMD)'],
            'offre_p1' => [
                "Organisée selon le système LMD (Licence-Master-Doctorat), la formation est payante et conduit à l'obtention d'un diplôme de Licence Professionnelle et de Master Recherche dans les mentions suivantes :",
                'Organized according to the LMD (License-Master-Doctorate) system, the training is fee-paying and leads to a Professional License and Research Master diploma in the following fields:',
                "Voalamina araka ny rafitra LMD (Licence-Master-Doctorat), ny fiofanana dia andoavam-bola ary mitondra mankany amin'ny fahazoana diplaoma Licence Professionnelle sy Master Recherche amin'ireto sampana manaraka ireto :",
            ],

            // Bourse
            'bourse_lien1_titre' => ["Postuler pour une Bourse d'État", "Postuler pour une Bourse d'État", "Postuler pour une Bourse d'État"],
            'bourse_lien1_description' => [
                "Les demandes de bourses d'études de l'État malagasy se font désormais en ligne via la plateforme officielle du Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESupReS).",
                "Les demandes de bourses d'études de l'État malagasy se font désormais en ligne via la plateforme officielle du Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESupReS).",
                "Les demandes de bourses d'études de l'État malagasy se font désormais en ligne via la plateforme officielle du Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESupReS).",
            ],
            'bourse_lien2_titre' => ['Créer votre portefeuille Trésor Public', 'Créer votre portefeuille Trésor Public', 'Créer votre portefeuille Trésor Public'],
            'bourse_lien2_description' => [
                "Inscrivez-vous sur la plateforme du Trésor Public de Madagascar pour créer votre propre portefeuille électronique et gérer directement votre bourse d'études.",
                "Inscrivez-vous sur la plateforme du Trésor Public de Madagascar pour créer votre propre portefeuille électronique et gérer directement votre bourse d'études.",
                "Inscrivez-vous sur la plateforme du Trésor Public de Madagascar pour créer votre propre portefeuille électronique et gérer directement votre bourse d'études.",
            ],

            // Mentions légales
            'mentions_legales_s1_texte' => [
                "Ce site est édité par l'Institut Supérieur des Sciences et Technologies de Mahajanga (ISSTM), établissement d'enseignement supérieur basé à Mahajanga, Madagascar.",
                "Ce site est édité par l'Institut Supérieur des Sciences et Technologies de Mahajanga (ISSTM), établissement d'enseignement supérieur basé à Mahajanga, Madagascar.",
                "Ce site est édité par l'Institut Supérieur des Sciences et Technologies de Mahajanga (ISSTM), établissement d'enseignement supérieur basé à Mahajanga, Madagascar.",
            ],
            'mentions_legales_s2_texte' => [
                'Email : isstm.univ.umg@gmail.com — Téléphone : +261 38 15 439 77 — Adresse : Mahajanga, Madagascar.',
                'Email : isstm.univ.umg@gmail.com — Téléphone : +261 38 15 439 77 — Adresse : Mahajanga, Madagascar.',
                'Email : isstm.univ.umg@gmail.com — Téléphone : +261 38 15 439 77 — Adresse : Mahajanga, Madagascar.',
            ],
            'mentions_legales_s3_texte' => [
                "Le site est hébergé sur l'infrastructure technique mise à disposition par l'ISSTM.",
                "Le site est hébergé sur l'infrastructure technique mise à disposition par l'ISSTM.",
                "Le site est hébergé sur l'infrastructure technique mise à disposition par l'ISSTM.",
            ],
            'mentions_legales_s4_texte' => [
                "L'ensemble des contenus présents sur ce site (textes, images, logos, mise en page) est la propriété de l'ISSTM, sauf mention contraire, et ne peut être reproduit sans autorisation préalable.",
                "L'ensemble des contenus présents sur ce site (textes, images, logos, mise en page) est la propriété de l'ISSTM, sauf mention contraire, et ne peut être reproduit sans autorisation préalable.",
                "L'ensemble des contenus présents sur ce site (textes, images, logos, mise en page) est la propriété de l'ISSTM, sauf mention contraire, et ne peut être reproduit sans autorisation préalable.",
            ],
            'mentions_legales_s5_texte' => [
                "L'ISSTM s'efforce d'assurer l'exactitude des informations diffusées sur ce site, mais ne saurait être tenu responsable des erreurs, omissions ou de l'indisponibilité temporaire du service.",
                "L'ISSTM s'efforce d'assurer l'exactitude des informations diffusées sur ce site, mais ne saurait être tenu responsable des erreurs, omissions ou de l'indisponibilité temporaire du service.",
                "L'ISSTM s'efforce d'assurer l'exactitude des informations diffusées sur ce site, mais ne saurait être tenu responsable des erreurs, omissions ou de l'indisponibilité temporaire du service.",
            ],

            // Confidentialité
            'confidentialite_s1_texte' => [
                "Dans le cadre de l'utilisation de ce site (inscription en ligne, création de compte, formulaire de contact, newsletter), nous pouvons collecter : votre nom, prénom, adresse email, numéro de téléphone, ainsi que les informations que vous saisissez volontairement dans nos formulaires.",
                "Dans le cadre de l'utilisation de ce site (inscription en ligne, création de compte, formulaire de contact, newsletter), nous pouvons collecter : votre nom, prénom, adresse email, numéro de téléphone, ainsi que les informations que vous saisissez volontairement dans nos formulaires.",
                "Dans le cadre de l'utilisation de ce site (inscription en ligne, création de compte, formulaire de contact, newsletter), nous pouvons collecter : votre nom, prénom, adresse email, numéro de téléphone, ainsi que les informations que vous saisissez volontairement dans nos formulaires.",
            ],
            'confidentialite_s2_texte' => [
                "Ces données sont utilisées exclusivement pour le traitement des inscriptions et candidatures, la gestion de votre compte, la réponse à vos demandes de contact, et l'envoi de la newsletter si vous y êtes abonné(e). Elles ne sont jamais vendues ni cédées à des tiers à des fins commerciales.",
                "Ces données sont utilisées exclusivement pour le traitement des inscriptions et candidatures, la gestion de votre compte, la réponse à vos demandes de contact, et l'envoi de la newsletter si vous y êtes abonné(e). Elles ne sont jamais vendues ni cédées à des tiers à des fins commerciales.",
                "Ces données sont utilisées exclusivement pour le traitement des inscriptions et candidatures, la gestion de votre compte, la réponse à vos demandes de contact, et l'envoi de la newsletter si vous y êtes abonné(e). Elles ne sont jamais vendues ni cédées à des tiers à des fins commerciales.",
            ],
            'confidentialite_s3_texte' => [
                "Le site utilise des cookies de session strictement nécessaires à son fonctionnement (maintien de la connexion, préférence de langue, thème visuel, comptage d'une visite par session). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.",
                "Le site utilise des cookies de session strictement nécessaires à son fonctionnement (maintien de la connexion, préférence de langue, thème visuel, comptage d'une visite par session). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.",
                "Le site utilise des cookies de session strictement nécessaires à son fonctionnement (maintien de la connexion, préférence de langue, thème visuel, comptage d'une visite par session). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.",
            ],
            'confidentialite_s4_texte' => [
                "Les mots de passe sont stockés de façon chiffrée et l'accès aux données personnelles est restreint au personnel administratif habilité de l'ISSTM. Les données sont conservées le temps nécessaire à la finalité pour laquelle elles ont été collectées.",
                "Les mots de passe sont stockés de façon chiffrée et l'accès aux données personnelles est restreint au personnel administratif habilité de l'ISSTM. Les données sont conservées le temps nécessaire à la finalité pour laquelle elles ont été collectées.",
                "Les mots de passe sont stockés de façon chiffrée et l'accès aux données personnelles est restreint au personnel administratif habilité de l'ISSTM. Les données sont conservées le temps nécessaire à la finalité pour laquelle elles ont été collectées.",
            ],
            'confidentialite_s5_texte' => [
                "Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données personnelles en nous contactant à isstm.univ.umg@gmail.com.",
                "Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données personnelles en nous contactant à isstm.univ.umg@gmail.com.",
                "Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données personnelles en nous contactant à isstm.univ.umg@gmail.com.",
            ],

            // Associations — carte d'identité
            'associations_identite_regime' => [
                'Association à but non lucratif — Ordonnance n°60-133 du 03/10/1960',
                'Association à but non lucratif — Ordonnance n°60-133 du 03/10/1960',
                'Association à but non lucratif — Ordonnance n°60-133 du 03/10/1960',
            ],
            'associations_identite_siege' => [
                'ISSTM, Majunga Be, Commune Urbaine Mahajanga-I',
                'ISSTM, Majunga Be, Commune Urbaine Mahajanga-I',
                'ISSTM, Majunga Be, Commune Urbaine Mahajanga-I',
            ],
            'associations_identite_duree' => ['Illimitée', 'Illimitée', 'Illimitée'],
            'associations_identite_but' => [
                "Rassembler et unir tous les étudiants de l'ISSTM",
                "Rassembler et unir tous les étudiants de l'ISSTM",
                "Rassembler et unir tous les étudiants de l'ISSTM",
            ],

            // Associations — critères du bureau exécutif
            'associations_bureau_role1_critere' => [
                "Seuls les niveaux L2 et M1 peuvent être élus Président de l'A.E.I.",
                "Seuls les niveaux L2 et M1 peuvent être élus Président de l'A.E.I.",
                "Seuls les niveaux L2 et M1 peuvent être élus Président de l'A.E.I.",
            ],
            'associations_bureau_role2_critere' => [
                'Désigné par le Président ; aucune restriction de niveau, sauf L1.',
                'Désigné par le Président ; aucune restriction de niveau, sauf L1.',
                'Désigné par le Président ; aucune restriction de niveau, sauf L1.',
            ],
            'associations_bureau_role3_critere' => [
                "Doit être un des candidats non-élus lors de l'élection du Président.",
                "Doit être un des candidats non-élus lors de l'élection du Président.",
                "Doit être un des candidats non-élus lors de l'élection du Président.",
            ],
            'associations_bureau_role4_critere' => [
                'Désigné par les autres membres du bureau et les chefs de classe.',
                'Désigné par les autres membres du bureau et les chefs de classe.',
                'Désigné par les autres membres du bureau et les chefs de classe.',
            ],
            'associations_bureau_role5_critere' => [
                'Chaque niveau (L1, L2, L3, M1, M2) envoie un représentant.',
                'Chaque niveau (L1, L2, L3, M1, M2) envoie un représentant.',
                'Chaque niveau (L1, L2, L3, M1, M2) envoie un représentant.',
            ],
            'associations_bureau_role6_critere' => [
                "Chaque mention désigne un représentant ; l'ex-Président en fait partie.",
                "Chaque mention désigne un représentant ; l'ex-Président en fait partie.",
                "Chaque mention désigne un représentant ; l'ex-Président en fait partie.",
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
                'debouches_fr' => "Développeur / Développeuse logiciel\nAdministrateur systèmes et réseaux\nIngénieur en cybersécurité\nData analyst / Data scientist\nChef de projet informatique\nIngénieur DevOps\nConsultant en systèmes d'information",
                'debouches_en' => "Software Developer\nSystems and Networks Administrator\nCybersecurity Engineer\nData analyst / Data scientist\nIT Project Manager\nDevOps Engineer\nInformation Systems Consultant",
                'debouches_mg' => "Software Developer\nAdministrateur Systems sy Networks\nCybersecurity Engineer\nMpikaroka momba ny angona\nIT Project Manager\nDevOps Injeniera\nInformation Systems Consultant",
                'historique_fr' => "L'informatique en tant que discipline scientifique est née au milieu du XXe siècle, avec les travaux fondateurs d'Alan Turing sur la calculabilité et la construction des premiers ordinateurs électroniques dans les années 1940-1950. Le génie informatique s'est ensuite structuré comme filière d'ingénierie à part entière à partir des années 1960-1970, avec l'essor des langages de programmation, des systèmes d'exploitation et des réseaux. Depuis les années 2000, la discipline connaît une expansion continue portée par Internet, le cloud computing, les objets connectés et l'intelligence artificielle.",
                'historique_en' => "Computer science as a scientific discipline originated in the mid-20th century, with Alan Turing's seminal work on computability and the construction of the first electronic computers in the 1940s-1950s. Computer engineering was then structured as an engineering field in its own right from the 1960s to the 1970s, with the rise of programming languages, operating systems and networks.",
                'historique_mg' => "Ny siansa informatika dia niforona tamin'ny tapaky ny taonjato faha-20, niaraka tamin'ny asan'i Alan Turing momba ny calculability sy ny fananganana ny ordinatera elektronika voalohany.",
                'avantages_fr' => "Un secteur en croissance constante, avec une forte demande de compétences dans presque tous les pays\nDes débouchés variés : développement logiciel, cybersécurité, intelligence artificielle, gestion de bases de données, administration réseau\nUne formation qui développe la logique, la rigueur et la capacité à résoudre des problèmes complexes\nDes outils et technologies universels, transférables dans quasiment tous les secteurs d'activité\nLa possibilité de travailler à distance ou de créer sa propre entreprise",
                'avantages_en' => "A constantly growing sector, with a high demand for skills in almost all countries\nVarious opportunities: software development, cybersecurity, artificial intelligence, database management, network administration\nTraining that develops logic, rigor and the ability to solve complex problems",
                'avantages_mg' => "Ny fitomboan'ny sehatra tsy mitsaha-mitombo, miaraka amin'ny tinady goavana ho an'ny fahaiza-manao any amin'ny ankamaroan'ny firenena rehetra\nFanofanana izay mampivelatra lojika, henjana ary ny fahafahana hamaha olana sarotra",
                'image_path' => 'images/filieres/genie-informatique.jpg', 'display_order' => 1,
            ],
            [
                'code' => 'GB', 'mention' => 'STNPA', 'niveaux' => 'L2,L3,M1,M2', 'slug' => 'genie-biomedical',
                'nom_fr' => 'Génie Biomédical', 'nom_en' => 'Biomedical Engineering', 'nom_mg' => 'Injeniera Biomedikaly',
                'description_fr' => 'Formation aux technologies médicales, à la maintenance des équipements et à l\'ingénierie de la santé.',
                'description_en' => 'Training in medical technologies, equipment maintenance, and health engineering.',
                'description_mg' => "Fiofanana momba ny teknolojia ara-pitsaboana, fikojakojana fitaovana ary injenieran'ny fahasalamana.",
                'debouches_fr' => "Ingénieur biomédical hospitalier\nTechnicien de maintenance d'équipements médicaux\nResponsable qualité en dispositifs médicaux\nIngénieur d'application pour fabricants d'équipements de santé\nConsultant en infrastructures hospitalières",
                'debouches_en' => "Hospital Biomedical Engineer\nMedical Equipment Maintenance Technician\nMedical Devices Quality Manager\nApplication Engineer for Health Equipment Manufacturers\nHospital Infrastructure Consultant",
                'debouches_mg' => "Biomedical Injeniera any amin'ny hopitaly\nMedical Fitaovana Maintenance Technician\nMpiasan'ny kalitaon'ny fitaovana ara-pitsaboana",
                'historique_fr' => "Le génie biomédical est une discipline relativement récente, apparue au cours du XXe siècle à la croisée de l'ingénierie, de la médecine et de la biologie. Son essor a été porté par l'invention d'appareils médicaux majeurs comme l'électrocardiographe, l'imagerie par résonance magnétique (IRM) et le scanner, ainsi que par le développement des prothèses et des dispositifs d'assistance.",
                'historique_en' => 'Biomedical engineering is a relatively new discipline that emerged during the 20th century at the crossroads of engineering, medicine and biology. Its rise was driven by the invention of major medical devices such as the electrocardiograph, magnetic resonance imaging (MRI) and the scanner.',
                'historique_mg' => "Biomedical injeniera dia famaizana vaovao nipoitra nandritra ny taonjato faha-20 amin'ny sampanan-dalana ny injeniera, fanafody sy ny biolojia.",
                'avantages_fr' => "Un secteur porteur de sens, directement utile à la santé et au bien-être des populations\nUne forte demande d'ingénieurs biomédicaux dans les hôpitaux, cliniques et industries pharmaceutiques\nUne formation pluridisciplinaire (électronique, informatique, biologie, mécanique)",
                'avantages_en' => 'A meaningful sector, directly useful for the health and well-being of populations. Strong demand for biomedical engineers in hospitals, clinics and pharmaceutical industries.',
                'avantages_mg' => "Sehatra manan-danja, ilaina mivantana ho an'ny fahasalamana sy ny fahasalaman'ny mponina",
                'image_path' => 'images/filieres/genie-biomedical.jpg', 'display_order' => 2,
            ],
            [
                'code' => 'GEI', 'mention' => 'STNPA', 'niveaux' => 'L1,L2,L3', 'slug' => 'genie-electronique-informatique',
                'nom_fr' => 'Génie Électronique et Informatique', 'nom_en' => 'Electronics and Computer Engineering', 'nom_mg' => 'Injeniera Elektronika sy Informatika',
                'description_fr' => 'Formation en électronique embarquée, Internet des Objets (IoT) et systèmes intelligents.',
                'description_en' => 'Training in embedded electronics, Internet of Things (IoT), and intelligent systems.',
                'description_mg' => "Fiofanana momba ny elektronika anaty, Internet an'ny Zavatra (IoT) ary rafitra manan-tsaina.",
                'debouches_fr' => "Ingénieur en électronique embarquée\nConcepteur de circuits imprimés (PCB)\nIngénieur systèmes embarqués\nTechnicien supérieur en maintenance électronique\nIngénieur R&D en objets connectés",
                'debouches_en' => 'Embedded Electronics Engineer, Printed circuit board (PCB) designer, Embedded Systems Engineer, Senior Electronics Maintenance Technician, Connected Objects R&D Engineer',
                'debouches_mg' => 'Electronics Engineer, PCB mpamorona, Embedded Systems Engineer',
                'historique_fr' => "Le génie électronique est né avec l'invention du transistor en 1947, qui a révolutionné la miniaturisation des circuits et ouvert la voie à l'électronique moderne. Associée à l'informatique à partir des années 1970 avec l'apparition des microprocesseurs, cette filière hybride forme des ingénieurs capables de concevoir aussi bien le matériel que les logiciels qui les pilotent.",
                'historique_en' => 'Electronic engineering was born with the invention of the transistor in 1947, which revolutionized the miniaturization of circuits and paved the way for modern electronics.',
                'historique_mg' => "Electronic injeniera dia teraka ny namorona ny transistor tamin'ny 1947.",
                'avantages_fr' => "Une double compétence matériel + logiciel très recherchée par les employeurs\nDes applications dans des secteurs variés : télécommunications, automobile, aéronautique, électroménager",
                'avantages_en' => 'Dual hardware + software skills highly sought after by employers. Applications in various sectors: telecommunications, automotive, aeronautics.',
                'avantages_mg' => 'Dual hardware + rindrambaiko fahaiza-manao tena nitady taorian\'ny mpampiasa',
                'image_path' => 'images/filieres/genie-electronique-informatique.jpg', 'display_order' => 3,
            ],
            [
                'code' => 'GE', 'mention' => 'STI', 'niveaux' => 'L1,L2,L3', 'slug' => 'genie-electrique',
                'nom_fr' => 'Génie Électrique', 'nom_en' => 'Electrical Engineering', 'nom_mg' => 'Injeniera Elektrika',
                'description_fr' => "Formation en électrotechnique, automatisme, et gestion de l'énergie électrique.",
                'description_en' => 'Training in electrotechnics, automation, and electrical energy management.',
                'description_mg' => 'Fiofanana momba ny elektroteknika, automatisme ary fitantanana ny angovo elektrika.',
                'debouches_fr' => "Ingénieur en distribution d'énergie électrique\nChef de projet en énergies renouvelables\nIngénieur en installations électriques industrielles\nTechnicien supérieur en électrotechnique\nResponsable maintenance électrique",
                'debouches_en' => null,
                'debouches_mg' => "Electric Power Distribution injeniera\nMpitantana tetik'asa momba ny angovo azo havaozina",
                'historique_fr' => "Le génie électrique trouve ses racines dans les travaux du XIXe siècle sur l'électromagnétisme (Faraday, Maxwell) et les premières applications industrielles de l'électricité, notamment la distribution d'énergie développée par Edison et Tesla.",
                'historique_en' => null,
                'historique_mg' => "Herinaratra injeniera manana ny fakany tamin'ny taonjato fahasivy ambin'ny folo.",
                'avantages_fr' => "Une filière indispensable : l'électricité reste au cœur de toutes les infrastructures modernes\nDes débouchés stables dans la production, le transport et la distribution d'énergie",
                'avantages_en' => null,
                'avantages_mg' => 'Sehatra iray tena ilaina: ny herinaratra dia mitoetra ao anatin\'ny fon\'ny fotodrafitrasa maoderina rehetra',
                'image_path' => 'images/filieres/genie-electrique.jpg', 'display_order' => 4,
            ],
            [
                'code' => 'GCIVIL', 'mention' => 'STGC', 'niveaux' => 'L1,L2,L3,M1,M2', 'slug' => 'genie-civil',
                'nom_fr' => 'Génie Civil', 'nom_en' => 'Civil Engineering', 'nom_mg' => 'Injeniera Sivily',
                'description_fr' => 'Formation en construction, calcul de structures et utilisation des matériaux de construction.',
                'description_en' => 'Training in construction, structural calculation, and use of construction materials.',
                'description_mg' => 'Fiofanana momba ny fanorenana, fikajiana rafitra ary fampiasana fitaovam-panorenana.',
                'debouches_fr' => "Ingénieur BTP (bâtiment et travaux publics)\nConducteur de travaux\nIngénieur structures\nChef de projet en construction\nTechnicien supérieur en génie civil",
                'debouches_en' => null,
                'debouches_mg' => null,
                'historique_fr' => "Le génie civil est l'une des plus anciennes formes d'ingénierie, ses racines remontant aux grandes constructions de l'Antiquité (pyramides, aqueducs romains). Il s'est structuré comme discipline scientifique moderne au XVIIIe et XIXe siècle avec le développement de la résistance des matériaux et du calcul des structures.",
                'historique_en' => null,
                'historique_mg' => null,
                'avantages_fr' => "Une filière historique et toujours indispensable : bâtir les infrastructures de demain\nDes débouchés stables dans le BTP, secteur porteur d'emplois dans de nombreux pays",
                'avantages_en' => null,
                'avantages_mg' => null,
                'image_path' => 'images/filieres/genie-civil.jpg', 'display_order' => 5,
            ],
            [
                'code' => 'GIND', 'mention' => 'STI', 'niveaux' => 'L1,L2,L3,M1,M2', 'slug' => 'genie-industriel',
                'nom_fr' => 'Génie Industriel', 'nom_en' => 'Industrial Engineering', 'nom_mg' => 'Injeniera Indostrialy',
                'description_fr' => 'Formation en management industriel, logistique, qualité et organisation de la production.',
                'description_en' => 'Training in industrial management, logistics, quality, and production organization.',
                'description_mg' => 'Fiofanana momba ny fitantanana indostrialy, lojistika, kalitao ary fandaminana ny famokarana.',
                'debouches_fr' => "Ingénieur qualité\nResponsable de production\nIngénieur logistique / supply chain\nConsultant en amélioration continue (Lean/Six Sigma)\nIngénieur méthodes et process", 'debouches_en' => null, 'debouches_mg' => null,
                'historique_fr' => "Le génie industriel s'est développé au début du XXe siècle avec les travaux de Frederick Taylor et Henry Ford sur l'organisation scientifique du travail et la production en série. La discipline a ensuite intégré les méthodes de gestion de la qualité (Toyota, Lean management) à partir des années 1950-1980, pour devenir une filière axée sur l'optimisation globale des systèmes de production, alliant ingénierie technique, gestion et logistique.", 'historique_en' => null, 'historique_mg' => null,
                'avantages_fr' => "Une formation transversale, à la croisée de la technique, de la gestion et de la logistique\nDes compétences recherchées dans toutes les industries manufacturières\nDes débouchés dans l'optimisation des processus, la qualité et la supply chain\nUne vision globale des systèmes de production, utile pour évoluer vers des postes de direction\nUne discipline qui valorise à la fois la rigueur analytique et le sens de l'organisation", 'avantages_en' => null, 'avantages_mg' => null,
                'image_path' => 'images/filieres/genie-industriel.jpg', 'display_order' => 6,
            ],
            [
                'code' => 'GT', 'mention' => 'STI', 'niveaux' => 'M1,M2', 'slug' => 'genie-thermique',
                'nom_fr' => 'Génie Thermique', 'nom_en' => 'Thermal Engineering', 'nom_mg' => 'Injeniera Termika',
                'description_fr' => "Formation en énergétique, thermodynamique, et optimisation de l'efficacité énergétique.",
                'description_en' => 'Training in energetics, thermodynamics, and energy efficiency optimization.',
                'description_mg' => "Fiofanana momba ny angovo, termodinamika ary fanatsarana ny fahombiazan'ny angovo.",
                'debouches_fr' => "Ingénieur en climatisation et ventilation (CVC)\nIngénieur efficacité énergétique\nTechnicien supérieur en installations thermiques\nChargé d'études thermiques du bâtiment\nIngénieur en procédés industriels thermiques", 'debouches_en' => null, 'debouches_mg' => null,
                'historique_fr' => "Le génie thermique s'appuie sur les principes de la thermodynamique établis au XIXe siècle par des scientifiques comme Carnot, Clausius et Kelvin. Il s'est développé comme discipline d'ingénierie appliquée avec l'essor des machines thermiques, des systèmes de chauffage, de ventilation et de climatisation (CVC) au cours du XXe siècle, et connaît aujourd'hui un regain d'intérêt avec les enjeux d'efficacité énergétique et de transition écologique.", 'historique_en' => null, 'historique_mg' => null,
                'avantages_fr' => "Une expertise essentielle pour le confort thermique des bâtiments et des industries\nDes débouchés croissants liés à la transition énergétique et aux économies d'énergie\nDes applications variées : climatisation, chauffage, réfrigération, procédés industriels\nUne formation technique solide en thermodynamique et en mécanique des fluides\nUne discipline de plus en plus valorisée face aux enjeux climatiques actuels", 'avantages_en' => null, 'avantages_mg' => null,
                'image_path' => 'images/filieres/genie-thermique.jpg', 'display_order' => 7,
            ],
            [
                'code' => 'GHYD', 'mention' => 'STGC', 'niveaux' => 'L1,L2,L3', 'slug' => 'genie-hydraulique',
                'nom_fr' => 'Génie Hydraulique', 'nom_en' => 'Hydraulic Engineering', 'nom_mg' => 'Injeniera Hydraulika',
                'description_fr' => 'Formation en gestion des ressources en eau, hydraulique urbaine et aménagements.',
                'description_en' => 'Training in water resource management, urban hydraulics, and developments.',
                'description_mg' => 'Fiofanana momba ny fitantanana ny rano, ny rano an-tanàn-dehibe ary ny fanajariana.',
                'debouches_fr' => "Ingénieur hydraulicien\nIngénieur en gestion des ressources en eau\nIngénieur en assainissement\nChargé d'études en irrigation\nTechnicien supérieur en réseaux hydrauliques", 'debouches_en' => "Hydraulic engineer\nWater resources management engineer\nSanitation engineer\nIrrigation study manager\nSenior technician in hydraulic networks", 'debouches_mg' => null,
                'historique_fr' => "L'hydraulique compte parmi les plus anciennes sciences de l'ingénieur, illustrée par les systèmes d'irrigation et d'adduction d'eau de l'Antiquité (Égypte, Mésopotamie, Empire romain). Elle s'est formalisée scientifiquement à partir du XVIIIe siècle avec les travaux de Bernoulli et d'autres pionniers de la mécanique des fluides, avant de devenir une filière d'ingénierie moderne appliquée à la gestion de l'eau, à l'irrigation, à l'assainissement et aux barrages hydroélectriques.", 'historique_en' => 'Hydraulics is one of the oldest engineering sciences, illustrated by the irrigation and water supply systems of Antiquity (Egypt, Mesopotamia, Roman Empire). It became scientifically formalized from the 18th century with the work of Bernoulli and other pioneers in fluid mechanics, before becoming a modern engineering sector applied to water management, irrigation, sanitation and hydroelectric dams.', 'historique_mg' => null,
                'avantages_fr' => "Une expertise cruciale pour la gestion durable des ressources en eau\nDes débouchés dans l'irrigation, l'assainissement, l'approvisionnement en eau potable\nDes opportunités dans les grands projets d'infrastructure (barrages, réseaux hydrauliques)\nUne discipline stratégique face aux enjeux climatiques et à la raréfaction de l'eau\nUne formation qui combine mécanique des fluides, génie civil et environnement", 'avantages_en' => 'Crucial expertise for the sustainable management of water resources\nOpportunities in irrigation, sanitation, drinking water supply\nOpportunities in large infrastructure projects (dams, hydraulic networks)\nA strategic discipline in the face of climate issues and water scarcity\nTraining that combines fluid mechanics, civil engineering and the environment', 'avantages_mg' => null,
                'image_path' => 'images/filieres/genie-hydraulique.jpg', 'display_order' => 8,
            ],
            [
                'code' => 'GARCHI', 'mention' => 'STGC', 'niveaux' => 'L1,L2,L3', 'slug' => 'genie-architecture',
                'nom_fr' => 'Génie Architecture', 'nom_en' => 'Architectural Engineering', 'nom_mg' => 'Injeniera Maritrano',
                'description_fr' => "Formation en conception architecturale, urbanisme, et design d'espace durable.",
                'description_en' => 'Training in architectural design, urban planning, and sustainable space design.',
                'description_mg' => 'Fiofanana momba ny famolavolana maritrano, fandrindrana ny tanàna ary famolavolana habaka maharitra.',
                'debouches_fr' => "Architecte / Ingénieur architecte\nDessinateur-projeteur en bâtiment\nChef de projet en conception architecturale\nUrbaniste\nConsultant en construction durable", 'debouches_en' => null, 'debouches_mg' => null,
                'historique_fr' => "L'architecture est l'une des disciplines les plus anciennes de l'humanité, présente depuis les premières civilisations à travers la conception d'habitats et de monuments. Le génie architectural moderne, qui associe la créativité de l'architecture aux exigences techniques de l'ingénierie (structures, matériaux, réglementation), s'est développé au cours du XXe siècle avec l'essor de l'urbanisation et des nouvelles techniques de construction, intégrant aujourd'hui les enjeux de durabilité et de conception assistée par ordinateur.", 'historique_en' => null, 'historique_mg' => null,
                'avantages_fr' => "Une filière qui allie créativité artistique et rigueur technique\nDes débouchés dans la conception de bâtiments résidentiels, publics et industriels\nDes opportunités croissantes autour de l'architecture durable et écologique\nUne formation qui développe la vision spatiale, le dessin technique et la gestion de projet\nUne discipline valorisante, avec un impact concret et visible sur le cadre de vie", 'avantages_en' => null, 'avantages_mg' => null,
                'image_path' => 'images/filieres/genie-architecture.jpg', 'display_order' => 9,
            ],
            [
                'code' => 'FE', 'mention' => 'STI', 'niveaux' => 'L1,L2,L3', 'slug' => 'froid-energie',
                'nom_fr' => 'Froid et Énergie', 'nom_en' => 'Refrigeration and Energy', 'nom_mg' => 'Hatsiaka sy Angovo',
                'description_fr' => 'Formation en systèmes frigorifiques, climatisation et gestion des énergies renouvelables.',
                'description_en' => 'Training in refrigeration systems, air conditioning and renewable energy management.',
                'description_mg' => 'Fampiofanana momba ny rafitra fampangatsiahana, fanamaivanana rivotra ary fitantanana angovo azo havaozina.',
                'debouches_fr' => "Ingénieur frigoriste\nIngénieur en efficacité énergétique\nTechnicien supérieur en froid industriel\nResponsable maintenance énergétique\nChargé d'études en systèmes frigorifiques", 'debouches_en' => null, 'debouches_mg' => null,
                'historique_fr' => "Les techniques du froid se sont développées à partir du XIXe siècle avec l'invention des premières machines frigorifiques, permettant la conservation des denrées alimentaires à grande échelle. Associée aux enjeux énergétiques modernes, cette filière a évolué pour englober la production, la distribution et l'optimisation de l'énergie, en particulier dans un contexte de transition énergétique et de recherche d'efficacité, devenant une discipline stratégique pour l'industrie agroalimentaire et le bâtiment.", 'historique_en' => null, 'historique_mg' => null,
                'avantages_fr' => "Une expertise recherchée dans l'agroalimentaire, la logistique et la conservation des denrées\nDes débouchés liés aux enjeux actuels d'efficacité énergétique\nDes applications variées : réfrigération industrielle, climatisation, production d'énergie\nUne formation technique alliant thermodynamique, électrotechnique et mécanique\nUn secteur stratégique pour la sécurité alimentaire et la transition énergétique", 'avantages_en' => null, 'avantages_mg' => null,
                'image_path' => 'images/filieres/froid-energie.jpg', 'display_order' => 10,
            ],
            [
                'code' => 'EII', 'mention' => 'STNPA', 'niveaux' => 'M1,M2', 'slug' => 'electronique-informatique-industrielle',
                'nom_fr' => 'Électronique et Informatique Industrielle', 'nom_en' => 'Electronics and Industrial Computing', 'nom_mg' => 'Elektronika sy Informatika Indostrialy',
                'description_fr' => "Formation en systèmes électroniques industriels, automatisation et informatique appliquée à l'industrie.",
                'description_en' => 'Training in industrial electronic systems, automation and computing applied to industry.',
                'description_mg' => "Fampiofanana momba ny rafitra elektronika indostrialy, fanaratana ary informatika ampiharina amin'ny indostria.",
                'debouches_fr' => "Ingénieur automaticien\nIngénieur en informatique industrielle\nTechnicien supérieur en maintenance industrielle\nIngénieur en robotique industrielle\nIntégrateur de systèmes automatisés", 'debouches_en' => null, 'debouches_mg' => null,
                'historique_fr' => "Cette filière est née de la convergence entre l'électronique, l'informatique et l'automatisation industrielle, un mouvement amorcé dans les années 1970-1980 avec l'apparition des automates programmables. Elle a pris une importance croissante avec la robotisation des usines et, plus récemment, avec l'avènement de l'industrie 4.0, qui connecte capteurs, machines et systèmes informatiques pour automatiser et optimiser les processus de production.", 'historique_en' => null, 'historique_mg' => null,
                'avantages_fr' => "Une filière au cœur de la modernisation industrielle (automatisation, robotique)\nDes débouchés dans la conception et la maintenance de systèmes automatisés\nUne double compétence électronique + informatique très recherchée en industrie\nDes opportunités croissantes avec l'essor de l'industrie 4.0 et de la robotique\nUne formation technique complète, adaptée aux besoins des usines modernes", 'avantages_en' => null, 'avantages_mg' => null,
                'image_path' => 'images/filieres/electronique-informatique-industrielle.png', 'display_order' => 11,
            ],
            [
                'code' => 'TR', 'mention' => 'STNPA', 'niveaux' => 'M1,M2', 'slug' => 'telecommunications-reseaux',
                'nom_fr' => 'Télécommunications et Réseaux', 'nom_en' => 'Telecommunications and Networks', 'nom_mg' => 'Fifandraisan-davitra sy Tambajotra',
                'description_fr' => 'Formation en réseaux informatiques, télécommunications et infrastructures numériques.',
                'description_en' => 'Training in computer networks, telecommunications and digital infrastructure.',
                'description_mg' => 'Fampiofanana momba ny tambajotra informatika, fifandraisan-davitra ary rafitra nomerika.',
                'debouches_fr' => "Ingénieur réseaux et télécommunications\nAdministrateur systèmes et réseaux\nIngénieur en sécurité des réseaux\nTechnicien supérieur en télécommunications\nConsultant en infrastructures réseau", 'debouches_en' => null, 'debouches_mg' => null,
                'historique_fr' => "Les télécommunications ont débuté avec l'invention du télégraphe électrique au XIXe siècle, suivie du téléphone, puis de la radio et de la télévision au XXe siècle. La discipline a connu une révolution majeure avec l'apparition d'Internet dans les années 1990 et le développement des réseaux mobiles (2G à 5G), transformant les télécommunications en une filière technologique centrale de la société connectée d'aujourd'hui.", 'historique_en' => null, 'historique_mg' => null,
                'avantages_fr' => "Un secteur stratégique, indispensable à la connectivité mondiale\nDes débouchés dans les opérateurs télécoms, les entreprises et les administrations\nDes opportunités croissantes avec le déploiement de la fibre optique et de la 5G\nUne formation technique solide en réseaux, transmission de données et sécurité\nUn secteur en perpétuelle évolution technologique, stimulant pour les esprits curieux", 'avantages_en' => null, 'avantages_mg' => null,
                'image_path' => 'images/filieres/telecommunications-reseaux.jpg', 'display_order' => 12,
            ],
            [
                'code' => 'GL', 'mention' => 'STNPA', 'niveaux' => 'M1,M2', 'slug' => 'genie-logiciel',
                'nom_fr' => 'Génie Logiciel', 'nom_en' => 'Software Engineering', 'nom_mg' => 'Injeniera Rindrambaiko',
                'description_fr' => 'Formation avancée en conception, développement et gestion de projets logiciels.',
                'description_en' => 'Advanced training in software design, development and project management.',
                'description_mg' => 'Fampiofanana mandroso momba ny famoronana, famolavolana ary fitantanana tetikasa rindrambaiko.',
                'debouches_fr' => "Développeur / Développeuse d'applications\nIngénieur logiciel\nChef de projet informatique\nArchitecte logiciel\nTesteur / Ingénieur qualité logicielle", 'debouches_en' => null, 'debouches_mg' => null,
                'historique_fr' => "Le génie logiciel est né dans les années 1960-1970 en réponse à la fameuse « crise du logiciel », lorsque la complexité croissante des programmes a révélé le besoin de méthodes rigoureuses de conception, de test et de gestion de projet informatique. Depuis, la discipline n'a cessé d'évoluer avec l'apparition de nouvelles méthodologies (agile, DevOps) et de nouveaux paradigmes de programmation, structurant aujourd'hui l'ensemble de l'industrie du logiciel.", 'historique_en' => null, 'historique_mg' => null,
                'avantages_fr' => "Une filière au cœur de la transformation numérique de tous les secteurs\nDes débouchés très nombreux : applications web, mobiles, systèmes d'entreprise\nUne formation qui développe la pensée logique et la gestion de projet\nDes méthodologies modernes (agile, DevOps) qui valorisent le travail en équipe\nUne profession offrant de nombreuses possibilités d'évolution ou d'entrepreneuriat", 'avantages_en' => null, 'avantages_mg' => null,
                'image_path' => 'images/filieres/genie-logiciel.jpg', 'display_order' => 13,
            ],
            [
                'code' => 'ISEA', 'mention' => 'STI', 'niveaux' => 'M1,M2', 'slug' => 'ingenierie-systemes-electriques-automatises',
                'nom_fr' => 'Ingénierie des Systèmes Électriques Automatisés', 'nom_en' => 'Engineering of Automated Electrical Systems', 'nom_mg' => 'Injeniera momba ny Rafitra Elektrika Mandrindra Tena',
                'description_fr' => 'Formation avancée en automatisation industrielle, robotique et systèmes électriques intelligents.',
                'description_en' => 'Advanced training in industrial automation, robotics and smart electrical systems.',
                'description_mg' => 'Fampiofanana mandroso momba ny fanaratana indostrialy, robotika ary rafitra elektrika mahay.',
                'debouches_fr' => "Ingénieur en systèmes automatisés\nIngénieur électrotechnicien\nTechnicien supérieur en automatisme industriel\nResponsable maintenance industrielle\nIngénieur en électronique de puissance", 'debouches_en' => null, 'debouches_mg' => null,
                'historique_fr' => "Cette filière combine l'histoire du génie électrique et celle de l'automatisation industrielle, deux disciplines qui ont convergé au cours du XXe siècle avec l'introduction des automates programmables et des systèmes de contrôle-commande. Elle s'est développée pour répondre aux besoins croissants d'automatisation des processus industriels, alliant électrotechnique, électronique de puissance et informatique industrielle.", 'historique_en' => null, 'historique_mg' => null,
                'avantages_fr' => "Une expertise très recherchée dans l'industrie moderne et l'automatisation\nDes débouchés dans la conception, l'installation et la maintenance de systèmes automatisés\nUne formation pluridisciplinaire : électrotechnique, automatisme, informatique industrielle\nDes opportunités croissantes avec la modernisation des infrastructures industrielles\nUne discipline stratégique pour la compétitivité industrielle", 'avantages_en' => null, 'avantages_mg' => null,
                'image_path' => 'images/filieres/ingenierie-systemes-electriques-automatises.jpg', 'display_order' => 14,
            ],
        ];

        foreach ($filieres as $filiere) {
            Filiere::updateOrCreate(['slug' => $filiere['slug']], $filiere);
        }
    }
}
