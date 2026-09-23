<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Widens `status` from a native enum (en_attente/approuve) to a plain
     * string so a third value (refuse) can be added without depending on a
     * database-specific ALTER ... ENUM(...) statement — validated in PHP via
     * the PreinscriptionStatus cast instead.
     */
    public function up(): void
    {
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->string('status', 20)->default('en_attente')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('preinscriptions', function (Blueprint $table) {
            $table->enum('status', ['en_attente', 'approuve'])->default('en_attente')->change();
        });
    }
};
