<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Every dossier field beyond the account step (nom/prenoms/civilite/sexe/
     * email/password) is now filled in progressively across the wizard, so
     * none of them can stay NOT NULL — a Brouillon row legitimately has most
     * of them empty until the candidate reaches that step.
     */
    public function up(): void
    {
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->date('date_naissance')->nullable()->change();
            $table->string('lieu_naissance', 150)->nullable()->change();
            $table->string('nationalite', 100)->nullable()->change();
            $table->string('annee_bacc', 10)->nullable()->change();
            $table->string('serie_bacc', 50)->nullable()->change();
            $table->string('mention_bacc', 30)->nullable()->change();
            $table->enum('code_redoublement', ['N', 'R'])->nullable()->change();
            $table->string('adresse')->nullable()->change();
            $table->string('telephone', 30)->nullable()->change();
            $table->string('pays', 100)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->date('date_naissance')->nullable(false)->change();
            $table->string('lieu_naissance', 150)->nullable(false)->change();
            $table->string('nationalite', 100)->nullable(false)->change();
            $table->string('annee_bacc', 10)->nullable(false)->change();
            $table->string('serie_bacc', 50)->nullable(false)->change();
            $table->string('mention_bacc', 30)->nullable(false)->change();
            $table->enum('code_redoublement', ['N', 'R'])->nullable(false)->change();
            $table->string('adresse')->nullable(false)->change();
            $table->string('telephone', 30)->nullable(false)->change();
            $table->string('pays', 100)->nullable(false)->change();
        });
    }
};
