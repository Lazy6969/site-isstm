<?php

namespace App\Http\Controllers\Bibliotheque;

use App\Http\Controllers\Controller;
use App\MemoireCategorie;
use App\Models\Bibliotheque\AnneeUniversitaire;
use App\Models\Bibliotheque\Filiere;
use App\Models\Bibliotheque\Memoire;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class MemoireController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $memoires = Memoire::query()
            ->with(['filiere.mention', 'annee'])
            ->when($request->filled('categorie'), fn ($query) => $query->where('categorie', $request->string('categorie')))
            ->when($request->filled('filiere_id'), fn ($query) => $query->where('filiere_id', $request->integer('filiere_id')))
            ->when($request->filled('annee_id'), fn ($query) => $query->where('annee_id', $request->integer('annee_id')))
            ->latest()
            ->get()
            ->map(fn (Memoire $m) => [
                'id' => $m->id,
                'titre' => $m->titre,
                'auteur' => $m->auteur,
                'categorie' => $m->categorie->value,
                'filiere' => $m->filiere->nom,
                'niveau' => $m->filiere->niveau->value,
                'mention' => $m->filiere->mention->abreviation,
                'annee' => $m->annee->libelle,
            ]);

        return Inertia::render('Bibliotheque/Memoires/Index', [
            'memoires' => $memoires,
            'categories' => array_map(fn (MemoireCategorie $c) => $c->value, MemoireCategorie::cases()),
            'filieresList' => Filiere::query()->with('mention')->orderBy('nom')->get()->map(fn (Filiere $f) => [
                'id' => $f->id,
                'label' => "{$f->nom} ({$f->niveau->value})",
            ]),
            'annees' => AnneeUniversitaire::query()->orderByDesc('libelle')->get(['id', 'libelle']),
            'filters' => $request->only(['categorie', 'filiere_id', 'annee_id']),
        ]);
    }

    public function show(Request $request, Memoire $memoire): InertiaResponse
    {
        $memoire->load(['filiere.mention', 'annee']);

        $token = Str::random(64);
        $request->session()->put("memoire_token_{$memoire->id}", [
            'token' => $token,
            'expire' => now()->addMinutes(5)->timestamp,
        ]);

        return Inertia::render('Bibliotheque/Memoires/Consulter', [
            'memoire' => [
                'id' => $memoire->id,
                'titre' => $memoire->titre,
                'auteur' => $memoire->auteur,
                'encadreur' => $memoire->encadreur,
                'categorie' => $memoire->categorie->value,
                'filiere' => $memoire->filiere->nom,
                'niveau' => $memoire->filiere->niveau->value,
                'mention' => $memoire->filiere->mention->abreviation,
                'annee' => $memoire->annee->libelle,
            ],
            'token' => $token,
        ]);
    }

    public function stream(Request $request, Memoire $memoire): Response
    {
        $token = $request->query('token');
        $header = $request->header('X-Requete-Visionneuse');

        if (! $token || ! $header) {
            abort(403, 'Accès refusé.');
        }

        $session = $request->session()->get("memoire_token_{$memoire->id}");

        if (! $session || ! hash_equals($session['token'], (string) $token) || $session['expire'] < now()->timestamp) {
            abort(403, 'Lien expiré ou invalide. Merci de recharger la page de consultation.');
        }

        abort_unless(Storage::disk('local')->exists($memoire->chemin_fichier), 404);

        return response(Storage::disk('local')->get($memoire->chemin_fichier), 200, [
            'Content-Type' => 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }
}
