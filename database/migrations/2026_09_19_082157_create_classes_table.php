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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->foreignId('filiere_id')->constrained()->cascadeOnDelete();
            $table->string('niveau', 10);
            $table->string('annee', 20);
            $table->unsignedInteger('effectif_max')->nullable();
            $table->timestamps();

            $table->unique(['filiere_id', 'niveau', 'annee', 'nom']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
