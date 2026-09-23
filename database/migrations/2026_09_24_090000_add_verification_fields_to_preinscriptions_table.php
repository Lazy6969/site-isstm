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
            $table->string('releve_bacc_path')->nullable()->after('photo_path');
            $table->string('cin_document_path')->nullable()->after('releve_bacc_path');
            $table->timestamp('reviewed_at')->nullable()->after('status');
            $table->text('motif_refus')->nullable()->after('reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->dropColumn(['releve_bacc_path', 'cin_document_path', 'reviewed_at', 'motif_refus']);
        });
    }
};
