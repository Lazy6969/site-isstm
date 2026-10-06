<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\OrgPerson;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ParcoursController extends Controller
{
    /**
     * Slugs of the two fixed downloadable documents on this page (see
     * Admin\OrgDocumentController) — kept apart from the admin's free-form
     * document library (App\Models\Document, category public/etudiant),
     * since these two slots are a fixed part of this page's layout.
     *
     * @var array<int, string>
     */
    private const DOCUMENT_SLUGS = ['organigramme', 'cursus'];

    public function index(): Response
    {
        $canDownload = (bool) Auth::user()?->is_active;

        return Inertia::render('Parcours', [
            'orgPeople' => OrgPerson::all()->keyBy('title_key'),
            'orgDocuments' => $canDownload
                ? Document::whereIn('slug', self::DOCUMENT_SLUGS)->pluck('file_path', 'slug')
                : [],
        ]);
    }
}
