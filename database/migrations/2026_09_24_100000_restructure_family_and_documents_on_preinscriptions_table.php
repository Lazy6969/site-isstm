<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->string('civilite', 10)->nullable()->after('sexe');
            $table->string('repondant_nom')->nullable()->after('nom_mere');
            $table->string('repondant_lien')->nullable()->after('repondant_nom');
            $table->string('repondant_telephone', 50)->nullable()->after('repondant_lien');
            $table->string('cin_recto_path')->nullable()->after('photo_path');
            $table->string('cin_verso_path')->nullable()->after('cin_recto_path');
            $table->string('diplome_attestation_path')->nullable()->after('cin_verso_path');

            $table->dropColumn(['profession_pere', 'profession_mere', 'adresse_parents', 'contact_parents_2', 'cin_document_path']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->string('profession_pere', 150)->nullable();
            $table->string('profession_mere', 150)->nullable();
            $table->string('adresse_parents')->nullable();
            $table->string('contact_parents_2', 50)->nullable();
            $table->string('cin_document_path')->nullable();

            $table->dropColumn(['civilite', 'repondant_nom', 'repondant_lien', 'repondant_telephone', 'cin_recto_path', 'cin_verso_path', 'diplome_attestation_path']);
        });
    }
};
