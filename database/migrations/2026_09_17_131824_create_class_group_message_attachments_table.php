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
        Schema::create('class_group_message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('class_group_messages')->cascadeOnDelete();
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->string('file_type');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_group_message_attachments');
    }
};
