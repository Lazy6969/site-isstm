<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The "Résultats" page shown under Établissement: a standalone, admin-
     * managed list of admitted candidates (imported from an Excel file or
     * entered by hand) — deliberately not tied to the `candidats`/
     * `preinscriptions` tables, see ResultatAdmission's docblock.
     */
    public function up(): void
    {
        Schema::create('resultat_admissions', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenoms')->nullable();
            $table->string('niveau')->nullable();
            $table->foreignId('filiere_id')->nullable()->constrained('filieres')->nullOnDelete();
            $table->date('date')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultat_admissions');
    }
};
