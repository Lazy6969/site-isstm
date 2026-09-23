<?php

namespace App\Http\Controllers;

use App\EvenementStatus;
use App\Models\Evenement;
use Inertia\Inertia;
use Inertia\Response;

class EvenementController extends Controller
{
    private const CALENDAR_COLUMNS = ['id', 'titre', 'description', 'date_debut', 'date_fin', 'lieu', 'image_path', 'categorie'];

    public function index(): Response
    {
        return Inertia::render('Evenements/Index', [
            'evenements' => Evenement::query()
                ->where('date_debut', '>=', now())
                ->where('status', EvenementStatus::Publie)
                ->orderBy('date_debut')
                ->get(self::CALENDAR_COLUMNS),
            // The calendar widget shows a fixed window (previous month through
            // 11 months ahead) so its month navigation never needs another
            // request — the same window the legacy site's calendar rendered
            // server-side. Kept separate from `evenements` (upcoming only)
            // since the calendar also needs the tail end of the past month.
            'calendrier' => Evenement::query()
                ->whereBetween('date_debut', [now()->startOfMonth()->subMonth(), now()->addMonths(11)->endOfMonth()])
                ->where('status', EvenementStatus::Publie)
                ->orderBy('date_debut')
                ->get(self::CALENDAR_COLUMNS),
        ]);
    }
}
