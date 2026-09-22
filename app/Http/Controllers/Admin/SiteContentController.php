<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use App\SiteIcon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SiteContentController extends Controller
{
    /**
     * Maps a content_key's prefix (the part before the first underscore) to a
     * human section label, so the admin can browse every quick-editable value
     * on the site without hunting for it page by page. A key whose prefix
     * isn't listed here still shows up, grouped under "Autres" — nothing is
     * ever hidden, this table only controls how it's labeled.
     *
     * @var array<string, string>
     */
    private const GROUPS = [
        'directeur' => 'Accueil — Direction',
        'mot' => 'Accueil — Direction',
        'mission' => 'Accueil — Mission & vision',
        'vision' => 'Accueil — Mission & vision',
        'logo' => 'Accueil — Général',
        'stat' => 'Accueil — Statistiques',
        'contact' => 'Contact',
        'inscription' => 'Inscription',
        'frais' => 'Frais de scolarité',
        'localisation' => 'Localisation',
        'histoire' => 'Histoire — Introduction',
        'creation' => 'Histoire — Création et contexte',
        'objectifs' => 'Histoire — Objectifs',
        'objectif' => 'Histoire — Objectifs',
        'statut' => 'Histoire — Statut et pédagogie',
        'offre' => 'Histoire — Offre de formation',
        'bourse' => 'Bourses',
        'mentions' => 'Mentions légales',
        'confidentialite' => 'Confidentialité',
        'associations' => 'Association des étudiants',
    ];

    public function index(): Response
    {
        $groups = SiteContent::orderBy('content_key')->get()
            ->groupBy(fn (SiteContent $content) => self::GROUPS[Str::before($content->content_key, '_')] ?? 'Autres')
            ->sortKeys()
            ->map(fn ($items) => $items->values());

        return Inertia::render('Admin/Contenu/Index', [
            'groups' => $groups,
            'icons' => array_column(SiteIcon::cases(), 'value'),
        ]);
    }
}
