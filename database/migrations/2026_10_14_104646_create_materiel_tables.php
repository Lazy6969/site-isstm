<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materiels', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('nom');
            $table->string('categorie', 30);
            $table->string('marque')->nullable();
            $table->string('modele')->nullable();
            $table->string('numero_serie')->nullable();
            $table->string('statut', 20)->default('disponible')->index();
            $table->string('localisation')->nullable();
            $table->date('date_acquisition')->nullable();
            $table->unsignedBigInteger('valeur')->nullable();
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('materiel_mouvements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materiel_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30);
            $table->string('de')->nullable();
            $table->string('vers')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['materiel_id', 'created_at']);
        });

        Schema::create('materiel_emprunts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materiel_id')->constrained()->cascadeOnDelete();
            $table->string('emprunteur_nom');
            $table->string('emprunteur_type', 20);
            $table->string('emprunteur_reference')->nullable();
            $table->string('emprunteur_contact')->nullable();
            $table->string('motif')->nullable();
            $table->date('date_sortie');
            $table->date('date_retour_prevue');
            $table->date('date_retour_effective')->nullable();
            $table->string('etat_au_retour', 20)->nullable();
            $table->text('note_retour')->nullable();
            $table->foreignId('prete_par')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('recu_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['materiel_id', 'date_retour_effective']);
            $table->index('date_retour_prevue');
        });

        Schema::create('materiel_interventions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materiel_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->string('titre');
            $table->text('description')->nullable();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->string('prestataire')->nullable();
            $table->unsignedBigInteger('cout')->nullable();
            $table->text('resolution')->nullable();
            $table->foreignId('signale_par')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('cloture_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['materiel_id', 'date_fin']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materiel_interventions');
        Schema::dropIfExists('materiel_emprunts');
        Schema::dropIfExists('materiel_mouvements');
        Schema::dropIfExists('materiels');
    }
};
