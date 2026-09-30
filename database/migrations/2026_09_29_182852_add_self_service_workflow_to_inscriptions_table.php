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
        Schema::table('inscriptions', function (Blueprint $table) {
            $table->foreignId('classe_id')->nullable()->change();

            $table->string('type')->nullable()->after('etudiant_id');
            $table->foreignId('filiere_id')->nullable()->after('classe_id')->constrained()->nullOnDelete();
            $table->string('niveau_souhaite', 10)->nullable()->after('filiere_id');
            $table->string('releve_notes_path')->nullable()->after('date_inscription');
            $table->string('piece_supplementaire_path')->nullable()->after('releve_notes_path');
            $table->string('numero_dossier')->nullable()->unique()->after('numero');
            $table->text('commentaire_correction')->nullable()->after('piece_supplementaire_path');
            $table->text('motif_refus')->nullable()->after('commentaire_correction');
            $table->timestamp('submitted_at')->nullable()->after('motif_refus');
            $table->timestamp('reviewed_at')->nullable()->after('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inscriptions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('filiere_id');
            $table->dropColumn([
                'type', 'niveau_souhaite', 'releve_notes_path', 'piece_supplementaire_path',
                'numero_dossier', 'commentaire_correction', 'motif_refus', 'submitted_at', 'reviewed_at',
            ]);

            $table->foreignId('classe_id')->nullable(false)->change();
        });
    }
};
