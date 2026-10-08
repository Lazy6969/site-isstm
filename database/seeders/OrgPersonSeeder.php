<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\OrgPerson;
use Illuminate\Database\Seeder;

class OrgPersonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedDocuments();

        $people = [
            ['title_key' => 'agent_affaires', 'name' => 'Mme. Secrétaire P.', 'photo_path' => 'images/organigramme/secretaire.jpg', 'sort_order' => 27],
            ['title_key' => 'college_enseignants', 'name' => 'Mme. Nathalie V.', 'photo_path' => 'images/organigramme/nathalie.jpg', 'sort_order' => 5],
            ['title_key' => 'conseil_etablissement', 'name' => 'Organe collégial', 'photo_path' => null, 'sort_order' => 1],
            ['title_key' => 'conseil_scientifique', 'name' => 'M. Lovas R.', 'photo_path' => 'images/organigramme/lovas.jpg', 'sort_order' => 4],
            ['title_key' => 'coordo_pedagogique', 'name' => 'Mme. Nathalie V.', 'photo_path' => 'images/organigramme/nathalie.jpg', 'sort_order' => 9],
            ['title_key' => 'directeur', 'name' => 'Dr. Hary Tiana R.', 'photo_path' => 'images/organigramme/directeur.jpg', 'sort_order' => 2],
            ['title_key' => 'division_coop', 'name' => 'Mme. Gestion F.', 'photo_path' => 'images/organigramme/gestion.jpg', 'sort_order' => 23],
            ['title_key' => 'division_labo', 'name' => 'M. Lovas R.', 'photo_path' => 'images/organigramme/lovas.jpg', 'sort_order' => 24],
            ['title_key' => 'division_logistique', 'name' => 'M. Chrysostome', 'photo_path' => 'images/organigramme/chrysostome.jpg', 'sort_order' => 37],
            ['title_key' => 'division_relations', 'name' => 'M. Maxwell A.', 'photo_path' => 'images/organigramme/maxwell.jpg', 'sort_order' => 25],
            ['title_key' => 'division_technique', 'name' => 'M. Telesphore', 'photo_path' => 'images/organigramme/telesphore.jpg', 'sort_order' => 38],
            ['title_key' => 'mention_gc', 'name' => 'Dr. Charles R.', 'photo_path' => 'images/organigramme/charles.jpg', 'sort_order' => 18],
            ['title_key' => 'mention_sti', 'name' => 'M. Telesphore', 'photo_path' => 'images/organigramme/telesphore.jpg', 'sort_order' => 14],
            ['title_key' => 'mention_stnpa', 'name' => 'M. Hary L.', 'photo_path' => 'images/organigramme/hary.jpg', 'sort_order' => 10],
            ['title_key' => 'parcours_garchi', 'name' => 'M. Moïse D.', 'photo_path' => 'images/organigramme/moise.jpg', 'sort_order' => 21],
            ['title_key' => 'parcours_gb', 'name' => 'M. Chrysostome', 'photo_path' => 'images/organigramme/chrysostome.jpg', 'sort_order' => 12],
            ['title_key' => 'parcours_gcivil', 'name' => 'Dr. Charles R.', 'photo_path' => 'images/organigramme/charles.jpg', 'sort_order' => 19],
            ['title_key' => 'parcours_ge', 'name' => 'M. Maxwell A.', 'photo_path' => 'images/organigramme/maxwell.jpg', 'sort_order' => 15],
            ['title_key' => 'parcours_gei', 'name' => 'M. Telesphore', 'photo_path' => 'images/organigramme/telesphore.jpg', 'sort_order' => 13],
            ['title_key' => 'parcours_ghyd', 'name' => 'M. Moïse D.', 'photo_path' => 'images/organigramme/moise.jpg', 'sort_order' => 20],
            ['title_key' => 'parcours_gi', 'name' => 'M. Hary L.', 'photo_path' => 'images/organigramme/hary.jpg', 'sort_order' => 11],
            ['title_key' => 'parcours_gind', 'name' => 'Mme. Gestion F.', 'photo_path' => 'images/organigramme/gestion.jpg', 'sort_order' => 16],
            ['title_key' => 'parcours_gt', 'name' => 'M. Lovas R.', 'photo_path' => 'images/organigramme/lovas.jpg', 'sort_order' => 17],
            ['title_key' => 'prmp', 'name' => 'Mme. Gestion F.', 'photo_path' => 'images/organigramme/gestion.jpg', 'sort_order' => 3],
            ['title_key' => 'resp_biblio', 'name' => 'Mme. Nathalie V.', 'photo_path' => 'images/organigramme/nathalie.jpg', 'sort_order' => 39],
            ['title_key' => 'resp_comm', 'name' => 'M. Judickael M.', 'photo_path' => 'images/organigramme/judickael.jpg', 'sort_order' => 8],
            ['title_key' => 'resp_diplomes', 'name' => 'M. Judickael M.', 'photo_path' => 'images/organigramme/judickael.jpg', 'sort_order' => 35],
            ['title_key' => 'resp_qualite', 'name' => 'M. Maxwell A.', 'photo_path' => 'images/organigramme/maxwell.jpg', 'sort_order' => 7],
            ['title_key' => 'resp_stats_diplomes', 'name' => 'M. Maxwell A.', 'photo_path' => 'images/organigramme/maxwell.jpg', 'sort_order' => 28],
            ['title_key' => 'secretaire_principal', 'name' => 'Mme. Secrétaire P.', 'photo_path' => 'images/organigramme/secretaire.jpg', 'sort_order' => 29],
            ['title_key' => 'secretariat_direction', 'name' => 'Mme. Secrétaire P.', 'photo_path' => 'images/organigramme/secretaire.jpg', 'sort_order' => 6],
            ['title_key' => 'secretariat_licence', 'name' => 'Mme. Secrétaire P.', 'photo_path' => 'images/organigramme/secretaire.jpg', 'sort_order' => 34],
            ['title_key' => 'secretariat_master', 'name' => 'Mme. Nathalie V.', 'photo_path' => 'images/organigramme/nathalie.jpg', 'sort_order' => 33],
            ['title_key' => 'service_compta', 'name' => 'M. Chrysostome', 'photo_path' => 'images/organigramme/chrysostome.jpg', 'sort_order' => 30],
            ['title_key' => 'service_cooperation', 'name' => 'Mme. Gestion F.', 'photo_path' => 'images/organigramme/gestion.jpg', 'sort_order' => 22],
            ['title_key' => 'service_logistique', 'name' => 'M. Chrysostome', 'photo_path' => 'images/organigramme/chrysostome.jpg', 'sort_order' => 36],
            ['title_key' => 'service_numerique', 'name' => 'M. Judickael M.', 'photo_path' => 'images/organigramme/judickael.jpg', 'sort_order' => 31],
            ['title_key' => 'service_scolarite', 'name' => 'Mme. Secrétaire P.', 'photo_path' => 'images/organigramme/secretaire.jpg', 'sort_order' => 32],
            ['title_key' => 'service_stats', 'name' => 'M. Maxwell A.', 'photo_path' => 'images/organigramme/maxwell.jpg', 'sort_order' => 26],
        ];

        foreach ($people as $person) {
            OrgPerson::updateOrCreate(['title_key' => $person['title_key']], $person);
        }
    }

    /**
     * The Parcours page's 6 fixed downloadable document files — 3 formats
     * (pdf/word/image) for each of the 2 documents (organigramme/cursus),
     * mirroring the legacy site's download section (see
     * Admin\OrgDocumentController / ParcoursController). Registers the files
     * already sitting in public/images/organigramme/ so they show up without
     * an admin having to re-upload them through the quick-edit pencil.
     */
    private function seedDocuments(): void
    {
        Document::whereIn('slug', ['organigramme', 'cursus'])->delete();

        $documents = [
            'organigramme_pdf' => ["Organigramme complet de l'ISSTM (PDF)", 'images/organigramme/organigramme.pdf'],
            'organigramme_word' => ["Organigramme complet de l'ISSTM (Word)", 'images/organigramme/organigramme.docx'],
            'organigramme_image' => ["Organigramme complet de l'ISSTM (Image)", 'images/organigramme/organigramme.jpeg'],
            'cursus_pdf' => ['Grille des cursus (PDF)', 'images/organigramme/cursus.pdf'],
            'cursus_word' => ['Grille des cursus (Word)', 'images/organigramme/cursus.docx'],
            'cursus_image' => ['Grille des cursus (Image)', 'images/organigramme/cursus.jpg'],
        ];

        foreach ($documents as $slug => [$title, $path]) {
            Document::updateOrCreate(
                ['slug' => $slug],
                ['title' => $title, 'category' => 'etudiant', 'file_path' => $path],
            );
        }
    }
}
