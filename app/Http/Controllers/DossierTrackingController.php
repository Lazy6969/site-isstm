<?php

namespace App\Http\Controllers;

use App\Models\Candidat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DossierTrackingController extends Controller
{
    /**
     * Public, anonymous dossier lookup by `numero_dossier` alone — the
     * number itself (e-mailed to the candidate at submission, see
     * PreinscriptionReceived) is what stands in for authentication here,
     * the same trust model as a parcel tracking number. Shows only the
     * same fields the candidate's own authenticated /mon-dossier page
     * already exposes (status, filière, niveau, matricule once accepted,
     * motif once refused) — never the uploaded documents/CIN/photo.
     */
    public function show(Request $request): Response
    {
        $numero = trim((string) $request->string('numero'));

        $preinscription = $numero === ''
            ? null
            : Candidat::query()
                ->select(['id', 'nom', 'prenoms', 'niveau', 'filiere_id', 'status', 'numero_dossier', 'reviewed_at', 'commentaire_correction', 'motif_refus'])
                ->with(['filiere:id,nom_fr', 'etudiant:id,candidat_id,matricule'])
                ->where('numero_dossier', $numero)
                ->first();

        return Inertia::render('Preinscription/Suivi', [
            'numero' => $numero,
            'preinscription' => $preinscription,
        ]);
    }
}
