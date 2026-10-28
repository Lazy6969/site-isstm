<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('community_documents', function (Blueprint $table) {
            // Calendar academic year (e.g. "2026"), distinct from `niveau`
            // (L1..M2) — same string format as classes.annee.
            $table->string('annee', 10)->nullable()->after('niveau');

            $table->index(['category', 'annee']);
        });
    }

    public function down(): void
    {
        Schema::table('community_documents', function (Blueprint $table) {
            $table->dropColumn('annee');
        });
    }
};
