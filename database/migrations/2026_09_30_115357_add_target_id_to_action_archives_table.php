<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Entries that act on an earlier entry (a restoration, a note) point to it.
     */
    public function up(): void
    {
        Schema::table('action_archives', function (Blueprint $table) {
            $table->unsignedBigInteger('target_id')->nullable()->after('subject_label')->index();
        });
    }

    public function down(): void
    {
        Schema::table('action_archives', function (Blueprint $table) {
            $table->dropColumn('target_id');
        });
    }
};
