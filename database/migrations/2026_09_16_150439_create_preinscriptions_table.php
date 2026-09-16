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
        Schema::create('preinscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('prenoms', 150);
            $table->enum('sexe', ['M', 'F']);
            $table->date('date_naissance');
            $table->string('lieu_naissance', 150);
            $table->string('cin', 30)->nullable();
            $table->string('nationalite', 100);
            $table->string('annee_bacc', 10);
            $table->string('serie_bacc', 50);
            $table->string('serie_bacc_autre', 150)->nullable();
            $table->string('mention_bacc', 30);
            $table->enum('code_redoublement', ['N', 'R']);
            $table->string('adresse');
            $table->string('telephone', 30);
            $table->string('email', 150);
            $table->string('nom_pere', 150)->nullable();
            $table->string('profession_pere', 150)->nullable();
            $table->string('nom_mere', 150)->nullable();
            $table->string('profession_mere', 150)->nullable();
            $table->string('adresse_parents')->nullable();
            $table->string('contact_parents', 50)->nullable();
            $table->string('contact_parents_2', 50)->nullable();
            $table->string('pays', 100);
            $table->foreignId('filiere_id')->nullable()->constrained()->nullOnDelete();
            $table->string('niveau', 10)->nullable();
            $table->string('photo_path')->nullable();
            $table->enum('status', ['en_attente', 'approuve'])->default('en_attente');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preinscriptions');
    }
};
