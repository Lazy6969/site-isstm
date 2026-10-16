<?php

namespace App\Http\Controllers;

use App\Models\ResultatAdmission;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The public "Résultats" page (Établissement dropdown) — every published
 * (non-archived, non-deleted) entry an admin has added from
 * Admin\ResultatAdmissionController. Filtering by niveau and searching by
 * name happen client-side (see Resultats/Index.jsx): the list a single
 * admission session publishes is small enough that fetching it whole, the
 * same choice already made for the site's other small public catalogs, is
 * simpler than a server round-trip per keystroke.
 */
class ResultatController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Resultats/Index', [
            'resultats' => ResultatAdmission::with('filiere:id,nom_fr')
                ->whereNull('archive_dossier_id')
                ->orderBy('nom')
                ->get(['id', 'nom', 'prenoms', 'niveau', 'filiere_id', 'date']),
        ]);
    }
}
