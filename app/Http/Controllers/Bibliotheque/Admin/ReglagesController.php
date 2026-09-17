<?php

namespace App\Http\Controllers\Bibliotheque\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bibliotheque\StoreAnneeRequest;
use App\Http\Requests\Bibliotheque\StoreBibFiliereRequest;
use App\Http\Requests\Bibliotheque\StoreMentionRequest;
use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Filiere;
use App\Models\Bibliotheque\Mention;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReglagesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Bibliotheque/Admin/Reglages', [
            'mentions' => Mention::query()->orderBy('nom')->get(),
            'filieres' => Filiere::query()->with('mention')->orderBy('nom')->get()->map(fn (Filiere $f) => [
                'id' => $f->id,
                'nom' => $f->nom,
                'abreviation' => $f->abreviation,
                'niveau' => $f->niveau->value,
                'mention_nom' => $f->mention->nom,
                'mention_abrev' => $f->mention->abreviation,
            ]),
            'annees' => AnneeUniversitaire::query()->orderByDesc('libelle')->get(),
        ]);
    }

    public function storeMention(StoreMentionRequest $request): RedirectResponse
    {
        Mention::query()->firstOrCreate(['abreviation' => $request->validated('abreviation')], [
            'nom' => $request->validated('nom'),
        ]);

        return back()->with('status', 'Mention ajoutée.');
    }

    public function destroyMention(Mention $mention): RedirectResponse
    {
        $mention->delete();

        return back()->with('status', 'Mention supprimée (filières et mémoires rattachés également supprimés).');
    }

    public function storeFiliere(StoreBibFiliereRequest $request): RedirectResponse
    {
        Filiere::create($request->validated());

        return back()->with('status', 'Filière ajoutée.');
    }

    public function destroyFiliere(Filiere $filiere): RedirectResponse
    {
        $filiere->delete();

        return back()->with('status', 'Filière supprimée (mémoires rattachés également supprimés).');
    }

    public function storeAnnee(StoreAnneeRequest $request): RedirectResponse
    {
        AnneeUniversitaire::create($request->validated());

        return back()->with('status', 'Année universitaire ajoutée.');
    }

    public function destroyAnnee(AnneeUniversitaire $annee): RedirectResponse
    {
        $annee->delete();

        return back()->with('status', 'Année universitaire supprimée.');
    }
}
