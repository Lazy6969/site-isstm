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
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->string('numero_dossier')->nullable()->unique()->after('status');
            $table->text('commentaire_correction')->nullable()->after('motif_refus');
            $table->timestamp('submitted_at')->nullable()->after('reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->dropColumn(['numero_dossier', 'commentaire_correction', 'submitted_at']);
        });
    }
};
