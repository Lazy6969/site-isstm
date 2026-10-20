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
            $table->string('lieu', 150)->index();
            $table->string('nom');
            $table->unsignedInteger('quantite')->default(1);
            $table->string('etat')->default('bon_etat')->index();
            $table->string('observation')->nullable();
            $table->foreignId('ajoute_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materiels');
    }
};
