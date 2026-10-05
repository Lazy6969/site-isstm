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
        Schema::table('users', function (Blueprint $table) {
            $table->string('profession')->nullable()->after('interests');
            $table->string('employer')->nullable()->after('profession');
            $table->string('education')->nullable()->after('employer');
            $table->string('hometown')->nullable()->after('education');
            $table->string('instagram_handle')->nullable()->after('personal_website');
            $table->string('snapchat_handle')->nullable()->after('instagram_handle');
            $table->string('tiktok_handle')->nullable()->after('snapchat_handle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'profession', 'employer', 'education', 'hometown',
                'instagram_handle', 'snapchat_handle', 'tiktok_handle',
            ]);
        });
    }
};
