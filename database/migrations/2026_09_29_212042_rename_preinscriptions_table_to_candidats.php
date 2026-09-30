<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Pure rename: a row in this table always represented the candidate, not
     * some separate "dossier" entity — "candidats" says that directly. MySQL
     * keeps the etudiants.preinscription_id foreign key pointed at the right
     * table automatically when the referenced table is renamed; only the
     * column itself needs its own rename below.
     */
    public function up(): void
    {
        Schema::rename('preinscriptions', 'candidats');

        Schema::table('etudiants', function (Blueprint $table) {
            $table->renameColumn('preinscription_id', 'candidat_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->renameColumn('candidat_id', 'preinscription_id');
        });

        Schema::rename('candidats', 'preinscriptions');
    }
};
