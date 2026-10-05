<?php

use App\Models\Etudiant;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The candidate's identity used to live only on `preinscriptions`, reached
     * through `etudiants.preinscription_id` — the admin étudiant screens had no
     * way to show or search it. These columns make the étudiant record
     * self-sufficient; PreinscriptionController::approve() populates them at
     * approval time, and this migration backfills existing étudiants from
     * their linked préinscription so nobody is left blank.
     */
    public function up(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->string('nom', 100)->nullable()->after('matricule');
            $table->string('prenoms', 150)->nullable()->after('nom');
            $table->string('civilite', 10)->nullable()->after('prenoms');
            $table->enum('sexe', ['M', 'F'])->nullable()->after('civilite');
            $table->date('date_naissance')->nullable()->after('sexe');
            $table->string('lieu_naissance', 150)->nullable()->after('date_naissance');
            $table->string('cin', 30)->nullable()->after('lieu_naissance');
            $table->string('nationalite', 100)->nullable()->after('cin');
            $table->string('pays', 100)->nullable()->after('nationalite');
            $table->string('adresse', 255)->nullable()->after('pays');
            $table->string('telephone', 30)->nullable()->after('adresse');
            $table->string('nom_pere', 150)->nullable()->after('telephone');
            $table->string('nom_mere', 150)->nullable()->after('nom_pere');
            $table->string('contact_parents', 50)->nullable()->after('nom_mere');
            $table->string('repondant_nom', 255)->nullable()->after('contact_parents');
            $table->string('repondant_lien', 255)->nullable()->after('repondant_nom');
            $table->string('repondant_telephone', 50)->nullable()->after('repondant_lien');
        });

        // Uses the current Etudiant::candidat() relation (renamed from
        // preinscription() by a later migration) — on a fresh install this
        // still runs before that later migration renames the preinscription_id
        // column itself, so the raw column filter below stays as-is.
        Etudiant::query()
            ->whereNotNull('preinscription_id')
            ->whereNull('nom')
            ->with('candidat')
            ->each(function (Etudiant $etudiant) {
                $preinscription = $etudiant->candidat;

                if ($preinscription === null) {
                    return;
                }

                $etudiant->forceFill([
                    'nom' => $preinscription->nom,
                    'prenoms' => $preinscription->prenoms,
                    'civilite' => $preinscription->civilite,
                    'sexe' => $preinscription->sexe,
                    'date_naissance' => $preinscription->date_naissance,
                    'lieu_naissance' => $preinscription->lieu_naissance,
                    'cin' => $preinscription->cin,
                    'nationalite' => $preinscription->nationalite,
                    'pays' => $preinscription->pays,
                    'adresse' => $preinscription->adresse,
                    'telephone' => $preinscription->telephone,
                    'nom_pere' => $preinscription->nom_pere,
                    'nom_mere' => $preinscription->nom_mere,
                    'contact_parents' => $preinscription->contact_parents,
                    'repondant_nom' => $preinscription->repondant_nom,
                    'repondant_lien' => $preinscription->repondant_lien,
                    'repondant_telephone' => $preinscription->repondant_telephone,
                ])->save();
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropColumn([
                'nom', 'prenoms', 'civilite', 'sexe', 'date_naissance', 'lieu_naissance',
                'cin', 'nationalite', 'pays', 'adresse', 'telephone',
                'nom_pere', 'nom_mere', 'contact_parents', 'repondant_nom', 'repondant_lien', 'repondant_telephone',
            ]);
        });
    }
};
