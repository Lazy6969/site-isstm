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
        Schema::create('site_content_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_content_id')->nullable()->constrained()->nullOnDelete();
            // Denormalized so a revision stays legible even if the content row is ever removed.
            $table->string('content_key');
            $table->string('type', 20);
            $table->text('content_value_fr')->nullable();
            $table->text('content_value_en')->nullable();
            $table->text('content_value_mg')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['site_content_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_content_revisions');
    }
};
