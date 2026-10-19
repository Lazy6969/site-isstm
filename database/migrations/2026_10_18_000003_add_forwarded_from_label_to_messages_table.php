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
        Schema::table('messages', function (Blueprint $table) {
            // Set instead of forwarded_from_id when the original message isn't
            // itself a `messages` row (e.g. forwarded in from a class group
            // chat) — forwarded_from_id's FK only ever points at another
            // `messages` row, so a cross-table forward has nothing to point
            // at and falls back to this plain label ("Transféré de {sender}")
            // for the same "Transféré de ..." badge without a real relation.
            $table->string('forwarded_from_label')->nullable()->after('forwarded_from_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('forwarded_from_label');
        });
    }
};
