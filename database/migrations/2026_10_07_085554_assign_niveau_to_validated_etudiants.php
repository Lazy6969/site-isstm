<?php

use App\Models\Classe;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Students accepted before approval started placing them in a niveau have
     * no class, so they showed up nowhere under Niveaux. Place each one in the
     * niveau (filière + level) its pré-inscription asked for. Students who
     * already have a class, or whose dossier never named a filière and a
     * level, are left alone.
     */
    public function up(): void
    {
        DB::table('etudiants')
            ->join('candidats', 'candidats.id', '=', 'etudiants.candidat_id')
            ->whereNull('etudiants.classe_id')
            ->whereNotNull('candidats.filiere_id')
            ->whereNotNull('candidats.niveau')
            ->get(['etudiants.id as etudiant_id', 'candidats.filiere_id', 'candidats.niveau'])
            ->each(function (object $row): void {
                $classe = Classe::forNiveau((int) $row->filiere_id, $row->niveau);

                DB::table('etudiants')->where('id', $row->etudiant_id)->update(['classe_id' => $classe->id]);
            });
    }

    /**
     * The placement can't be told apart from one an admin made by hand, so
     * there is nothing safe to undo.
     */
    public function down(): void
    {
        //
    }
};
