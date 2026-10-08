<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The dashboard's "Activité récente" is worked out from the dossiers
     * themselves, so removing an entry can't delete anything — it only hides
     * it, for the one account that asked. `activity_key` is "{type}-{id}" of the
     * dossier the entry came from (e.g. "preinscription-3").
     */
    public function up(): void
    {
        Schema::create('dismissed_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('activity_key', 60);
            $table->timestamps();

            $table->unique(['user_id', 'activity_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dismissed_activities');
    }
};
