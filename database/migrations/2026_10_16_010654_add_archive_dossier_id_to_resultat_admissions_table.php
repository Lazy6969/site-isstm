<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replaces the plain `archived_at` timestamp with a real, named, dated
     * batch (`archive_dossiers` — see ArchiveDossier) that every archived
     * résultat belongs to. Any row already archived under the old column is
     * grouped by its exact archived_at value (rows archived together in one
     * bulk action share that timestamp) and folded into one dossier per
     * group, so no existing archived data is lost.
     */
    public function up(): void
    {
        Schema::table('resultat_admissions', function (Blueprint $table) {
            $table->foreignId('archive_dossier_id')->nullable()->after('filiere_id')->constrained('archive_dossiers')->nullOnDelete();
        });

        $groups = DB::table('resultat_admissions')->whereNotNull('archived_at')->select('archived_at')->distinct()->pluck('archived_at');

        foreach ($groups as $archivedAt) {
            $dossierId = DB::table('archive_dossiers')->insertGetId([
                'nom' => 'Archive du '.Carbon::parse($archivedAt)->translatedFormat('d/m/Y'),
                'date' => Carbon::parse($archivedAt)->toDateString(),
                'created_at' => $archivedAt,
                'updated_at' => $archivedAt,
            ]);

            DB::table('resultat_admissions')->where('archived_at', $archivedAt)->update(['archive_dossier_id' => $dossierId]);
        }

        Schema::table('resultat_admissions', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }

    public function down(): void
    {
        Schema::table('resultat_admissions', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable();
        });

        DB::table('resultat_admissions')
            ->join('archive_dossiers', 'resultat_admissions.archive_dossier_id', '=', 'archive_dossiers.id')
            ->update(['resultat_admissions.archived_at' => DB::raw('archive_dossiers.created_at')]);

        Schema::table('resultat_admissions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('archive_dossier_id');
        });
    }
};
