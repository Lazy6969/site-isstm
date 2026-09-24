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
            $table->foreignId('reply_to_id')->nullable()->after('sender_id')->constrained('messages')->nullOnDelete();
            $table->foreignId('forwarded_from_id')->nullable()->after('reply_to_id')->constrained('messages')->nullOnDelete();
            $table->timestamp('edited_at')->nullable()->after('read_at');
            $table->timestamp('deleted_at')->nullable()->after('edited_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reply_to_id');
            $table->dropConstrainedForeignId('forwarded_from_id');
            $table->dropColumn(['edited_at', 'deleted_at']);
        });
    }
};
