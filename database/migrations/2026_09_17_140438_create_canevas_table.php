<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'bibliotheque';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('canevas', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('niveau');
            $table->foreignId('annee_id')->constrained('annees_universitaires')->cascadeOnDelete();
            $table->string('type_fichier');
            $table->string('chemin_fichier');
            $table->timestamps();

            $table->index('niveau');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('canevas');
    }
};
