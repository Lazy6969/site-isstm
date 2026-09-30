<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitInscriptionDossierRequest;
use App\Http\Requests\UpdateInscriptionDraftRequest;
use App\Models\Filiere;
use App\Models\Inscription;
use App\Models\SiteContent;
use App\Models\User;
use App\Notifications\InscriptionDossierSubmitted;
use App\StatutInscription;
use App\TypeInscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class InscriptionDossierController extends Controller
{
    /**
     * Self-service réinscription/redoublement: one dossier per étudiant per
     * année universitaire, created lazily on first visit and reused for every
     * draft save until it's submitted — the DB's unique(etudiant_id, annee)
     * makes a second, independent dossier for the same year impossible.
     */
    public function create(Request $request): Response
    {
        $annee = $this->anneeUniversitaireCourante();
        $etudiant = $request->user()->etudiant;

        $inscription = Inscription::where('etudiant_id', $etudiant->id)
            ->where('annee', $annee)
            ->first();

        if ($inscription === null) {
            $inscription = Inscription::create([
                'etudiant_id' => $etudiant->id,
                'annee' => $annee,
                'statut' => StatutInscription::Brouillon,
            ]);
        }

        return Inertia::render('Inscription/Dossier', [
            'content' => SiteContent::all()->keyBy('content_key')->map(fn (SiteContent $item) => $item->content_value_fr),
            'filieres' => Filiere::orderBy('display_order')->get(['id', 'nom_fr as nom', 'niveaux']),
            'inscription' => $inscription,
            // Pre-selects the type radio when the student arrived from a specific
            // "Réinscription"/"Redoublant" choice on /inscription — never
            // overrides a type the dossier already has.
            'suggestedType' => in_array($request->query('type'), ['reinscription', 'redoublement'], true) ? $request->query('type') : null,
        ]);
    }

    public function saveDraft(UpdateInscriptionDraftRequest $request, Inscription $inscription): RedirectResponse
    {
        $data = $request->safe()->except(['releve_notes', 'piece_supplementaire']);

        if ($request->hasFile('releve_notes')) {
            $data['releve_notes_path'] = $request->file('releve_notes')->store('inscriptions', 'public');
        }
        if ($request->hasFile('piece_supplementaire')) {
            $data['piece_supplementaire_path'] = $request->file('piece_supplementaire')->store('inscriptions', 'public');
        }

        $inscription->update($data);

        return redirect()->route('inscription-dossier.create')->with('status', 'Brouillon enregistré.');
    }

    public function submit(SubmitInscriptionDossierRequest $request, Inscription $inscription): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $inscription) {
                $data = $request->safe()->except(['releve_notes', 'piece_supplementaire']);

                if ($request->hasFile('releve_notes')) {
                    $data['releve_notes_path'] = $request->file('releve_notes')->store('inscriptions', 'public');
                }
                if ($request->hasFile('piece_supplementaire')) {
                    $data['piece_supplementaire_path'] = $request->file('piece_supplementaire')->store('inscriptions', 'public');
                }

                $type = TypeInscription::from($data['type']);
                $data['numero_dossier'] ??= Inscription::generateNumeroDossier($type);
                $data['statut'] = StatutInscription::EnAttente;
                $data['submitted_at'] = now();
                $data['commentaire_correction'] = null;

                $inscription->update($data);
            });
        } catch (Throwable $e) {
            report($e);
            Log::error('inscription-dossier.submit: failed to save the dossier', ['inscription_id' => $inscription->id, 'message' => $e->getMessage()]);

            return redirect()->route('inscription-dossier.create')->with('error', "Une erreur est survenue et votre dossier n'a pas pu être enregistré. Réessayez, ou contactez la scolarité si le problème persiste.");
        }

        Log::info('inscription-dossier.submit: dossier submitted', ['inscription_id' => $inscription->id]);

        try {
            Notification::send(User::permission('inscriptions.edit')->get(), new InscriptionDossierSubmitted($inscription->fresh(['etudiant.user'])));
        } catch (Throwable $e) {
            report($e);
        }

        return redirect()->route('inscription-dossier.create')->with('status', 'Votre dossier a bien été envoyé à la scolarité.');
    }

    private function anneeUniversitaireCourante(): string
    {
        return SiteContent::where('content_key', 'inscription_annee_universitaire')->value('content_value_fr')
            ?? (string) now()->year;
    }
}
