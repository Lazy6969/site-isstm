<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materiel_maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materiel_id')->constrained('materiels')->cascadeOnDelete();
            $table->string('description', 500);
            $table->string('etat_apres')->nullable();
            $table->foreignId('cree_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materiel_maintenances');
    }
};
