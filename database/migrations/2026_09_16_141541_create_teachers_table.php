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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->enum('category', ['permanent', 'vacataire']);
            $table->string('specialty_fr');
            $table->string('specialty_en')->nullable();
            $table->string('specialty_mg')->nullable();
            $table->text('description_fr')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_mg')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('email', 190)->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
