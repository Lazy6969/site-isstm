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
        Schema::table('evenements', function (Blueprint $table) {
            // Defaults to 'publie', not 'brouillon' — unlike news/gallery, events had
            // no status column before, so every existing row was implicitly public.
            $table->string('status')->default('publie')->after('categorie');
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
        Schema::table('evenements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('validated_by');
            $table->dropColumn(['status', 'rejection_reason', 'validated_at']);
        });
    }
};
