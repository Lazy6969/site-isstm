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
        Schema::create('campus_blocs', function (Blueprint $table) {
            $table->id();
            $table->string('bloc_key', 50)->unique();
            $table->string('nom');
            $table->text('signification')->nullable();
            $table->string('fondation')->nullable();
            $table->string('fondateurs')->nullable();
            $table->string('slogan')->nullable();
            $table->text('objectifs')->nullable();
            $table->text('activites')->nullable();
            $table->string('danse')->nullable();
            $table->string('mampiavaka')->nullable();
            $table->json('images')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campus_blocs');
    }
};
