<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Append-only archive of every state-changing action made in the console.
     * `changes` / `input` are plain JSON text (not a JSON column) so the exact
     * bytes hashed into the chain are the bytes read back later.
     */
    public function up(): void
    {
        Schema::create('action_archives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('user_role')->nullable();
            $table->string('method', 10);
            $table->string('route_name')->nullable();
            $table->string('path', 500);
            $table->string('module', 60)->nullable()->index();
            $table->string('action', 60)->nullable()->index();
            $table->string('subject_label', 500)->nullable();
            $table->string('outcome', 12)->default('success')->index();
            $table->unsignedSmallInteger('status_code')->nullable();
            $table->longText('changes')->nullable();
            $table->longText('input')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->char('previous_hash', 64);
            $table->char('hash', 64)->unique();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('action_archives');
    }
};
