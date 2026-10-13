<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ecolage_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained()->cascadeOnDelete();
            $table->string('annee_universitaire', 9);
            $table->string('type', 20);
            $table->string('mode', 20);
            $table->unsignedBigInteger('amount');
            $table->string('reference', 60);
            $table->date('paid_at');
            // Proofs stay on the private disk and are only served through an
            // authorised route — never linked straight from /storage.
            $table->string('receipt_path');
            $table->string('card_path');
            $table->string('status', 20)->default('en_attente');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('motif_refus')->nullable();
            $table->timestamps();

            $table->index(['etudiant_id', 'annee_universitaire']);
            $table->index(['status', 'created_at']);
            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ecolage_payments');
    }
};
