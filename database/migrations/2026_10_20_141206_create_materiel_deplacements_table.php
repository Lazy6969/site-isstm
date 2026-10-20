<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materiel_deplacements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materiel_id')->constrained('materiels')->cascadeOnDelete();
            $table->string('lieu_origine', 150);
            $table->string('lieu_destination', 150);
            $table->string('motif')->nullable();
            $table->string('emprunteur', 150);
            $table->unsignedInteger('quantite');
            $table->string('statut')->default('en_cours');
            $table->timestamp('date_retour')->nullable();
            $table->foreignId('cree_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['materiel_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materiel_deplacements');
    }
};
