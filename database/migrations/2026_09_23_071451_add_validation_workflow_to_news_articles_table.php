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
        // Widening a native DB enum column needs doctrine/dbal (not installed) —
        // drop and re-add as a plain string instead, cast to NewsStatus in the model.
        Schema::table('news_articles', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('news_articles', function (Blueprint $table) {
            $table->string('status')->default('brouillon')->after('image_path');
            $table->string('rejection_reason')->nullable()->after('status');
            $table->foreignId('validated_by')->nullable()->after('rejection_reason')->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable()->after('validated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news_articles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('validated_by');
            $table->dropColumn(['rejection_reason', 'validated_at']);
            $table->dropColumn('status');
        });

        Schema::table('news_articles', function (Blueprint $table) {
            $table->enum('status', ['brouillon', 'publie'])->default('brouillon')->after('image_path');
        });
    }
};
