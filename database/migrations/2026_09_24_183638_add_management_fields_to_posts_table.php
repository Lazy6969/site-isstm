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
        Schema::table('posts', function (Blueprint $table) {
            $table->boolean('comments_disabled')->default(false)->after('body');
            $table->timestamp('archived_at')->nullable()->after('comments_disabled');
            $table->timestamp('pinned_at')->nullable()->after('archived_at');
            $table->timestamp('edited_at')->nullable()->after('pinned_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['comments_disabled', 'archived_at', 'pinned_at', 'edited_at']);
        });
    }
};
