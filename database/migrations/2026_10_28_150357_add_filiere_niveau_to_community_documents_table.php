<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('community_documents', function (Blueprint $table) {
            $table->foreignId('filiere_id')->nullable()->after('category')->constrained()->nullOnDelete();
            $table->string('niveau', 10)->nullable()->after('filiere_id'); // L1, L2, L3, M1, M2 — same codes as classes.niveau

            $table->index(['filiere_id', 'niveau']);
        });
    }

    public function down(): void
    {
        Schema::table('community_documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('filiere_id');
            $table->dropColumn('niveau');
        });
    }
};
