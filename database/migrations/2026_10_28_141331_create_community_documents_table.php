<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category'); // 'lecon' | 'sujet'
            $table->string('title');
            $table->string('file_path');
            $table->string('status')->default('en_attente');
            $table->string('rejection_reason')->nullable();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_documents');
    }
};
