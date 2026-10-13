<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 10);
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['document_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_interactions');
    }
};
