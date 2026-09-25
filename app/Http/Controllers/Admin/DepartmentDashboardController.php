<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Inscription;
use App\Models\Preinscription;
use App\PreinscriptionStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Landing page for a department subdomain (scolarite/enseignant/materiel),
 * shown right after login. Kept separate from the main Admin/Dashboard page
 * because that page's sidebar links are root-relative ("/console/...") and
 * would 404 on a subdomain — here the "open the full admin" links below are
 * built as absolute URLs to the main domain instead.
 */
class DepartmentDashboardController extends Controller
{
    private const LABELS = [
        'scolarite' => 'Scolarité',
        'enseignant' => 'Enseignant',
        'materiel' => 'Matériel',
    ];

    public function index(Request $request): Response
    {
        $department = $request->route('department');
        // Same scheme as the current request (Herd serves everything over https),
        // but the root host — not the department subdomain — since these links
        // open the existing, unmodified admin console on the main domain.
        $base = $request->getScheme().'://'.parse_url(config('app.url'), PHP_URL_HOST);

        return Inertia::render('Department/Dashboard', [
            'department' => $department,
            'label' => self::LABELS[$department] ?? $department,
            'stats' => $department === 'scolarite' ? $this->scolariteStats() : null,
            'links' => $this->links($department, $base),
        ]);
    }

    /**
     * @return array<int, array{label: string, url: string}>
     */
    private function links(string $department, string $base): array
    {
        return match ($department) {
            'scolarite' => [
                ['label' => 'Étudiants', 'url' => "{$base}/console/scolarite/etudiants"],
                ['label' => 'Inscriptions', 'url' => "{$base}/console/scolarite/inscriptions"],
                ['label' => 'Niveaux', 'url' => "{$base}/console/scolarite/classes"],
                ['label' => 'Préinscriptions', 'url' => "{$base}/console/preinscriptions"],
            ],
            default => [
                ['label' => "Tableau de bord de l'administration", 'url' => "{$base}/console/dashboard"],
            ],
        };
    }

    /**
     * @return array{etudiants: int, inscriptions: int, classes: int, preinscriptions_en_attente: int}
     */
    private function scolariteStats(): array
    {
        return [
            'etudiants' => Etudiant::count(),
            'inscriptions' => Inscription::count(),
            'classes' => Classe::count(),
            'preinscriptions_en_attente' => Preinscription::where('status', PreinscriptionStatus::Soumis)->count(),
        ];
    }
}
