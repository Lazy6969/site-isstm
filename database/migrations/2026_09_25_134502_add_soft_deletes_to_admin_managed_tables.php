<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables behind the admin "Corbeille" (trash) — every model an admin can
     * delete from the console, except the student account deletion in
     * EtudiantController, which is a deliberate, permanent, cascading wipe.
     *
     * @var array<int, string>
     */
    private const TABLES = [
        'campus_blocs', 'classes', 'documents', 'evenements', 'filieres',
        'gallery_albums', 'gallery_photos', 'hero_slides', 'inscriptions',
        'news_articles', 'partenaires', 'teachers', 'testimonials',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropSoftDeletes();
            });
        }
    }
};
