<?php

namespace App\Http\Controllers\Materiel;

use App\Http\Controllers\Controller;
use App\MaterielStatut;
use App\Models\ActivityLog;
use App\Models\Materiel;
use App\Models\MaterielEmprunt;
use App\Models\MaterielIntervention;
use App\Services\MaterielService;
use App\XlsxWriter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MaterielController extends Controller
{
    public function __construct(private readonly MaterielService $materiels) {}

    public function index(): Response
    {
        $items = Materiel::with(['empruntEnCours', 'interventionOuverte'])
            ->orderBy('nom')
            ->limit(2000)
            ->get();

        return Inertia::render('Materiel/Inventaire/Index', [
            'materiels' => $items->map(fn (Materiel $materiel) => self::present($materiel))->values(),
            'options' => self::options(),
            'localisations' => $items->pluck('localisation')->filter()->unique()->sort()->values(),
        ]);
    }

    public function show(Materiel $materiel): Response
    {
        $materiel->load(['empruntEnCours', 'interventionOuverte']);

        return Inertia::render('Materiel/Inventaire/Show', [
            'materiel' => self::present($materiel),
            'mouvements' => $materiel->mouvements()->with('user:id,name')->get()->map(fn ($mouvement) => [
                'id' => $mouvement->id,
                'type' => $mouvement->type->value,
                'label' => $mouvement->type->label(),
                'de' => $mouvement->de,
                'vers' => $mouvement->vers,
                'note' => $mouvement->note,
                'user' => $mouvement->user?->name,
                'created_at' => $mouvement->created_at,
            ])->values(),
            'emprunts' => $materiel->emprunts()->get()->map(fn (MaterielEmprunt $emprunt) => self::presentEmprunt($emprunt))->values(),
            'interventions' => $materiel->interventions()->with('signaleur:id,name')->get()->map(fn (MaterielIntervention $intervention) => self::presentIntervention($intervention))->values(),
            'options' => self::options(),
            'localisations' => Materiel::query()->whereNotNull('localisation')->distinct()->orderBy('localisation')->pluck('localisation'),
        ]);
    }

    public function store(Request $request, MaterielService $service): RedirectResponse
    {
        $data = $this->validated($request);
        $data['photo_path'] = $this->storePhoto($request);

        $materiel = $service->register($data, $request->user());
        ActivityLog::record('materiel_created', "Matériel « {$materiel->nom} » ({$materiel->code}) ajouté à l'inventaire", $materiel);

        return back()->with('status', 'Matériel ajouté à l\'inventaire.');
    }

    public function update(Request $request, Materiel $materiel): RedirectResponse
    {
        $data = $this->validated($request, $materiel);

        if ($request->hasFile('photo')) {
            $this->deletePhoto($materiel->photo_path);
            $data['photo_path'] = $this->storePhoto($request);
        }

        $materiel->update($data);
        ActivityLog::record('materiel_updated', "Matériel « {$materiel->nom} » ({$materiel->code}) modifié", $materiel);

        return back()->with('status', 'Matériel mis à jour.');
    }

    /**
     * Soft delete: it goes to the Corbeille and can be restored from there.
     */
    public function destroy(Materiel $materiel): RedirectResponse
    {
        abort_if($materiel->statut === MaterielStatut::Emprunte, 409, 'Ce matériel est prêté : enregistrez son retour avant de le supprimer.');

        ActivityLog::record('materiel_deleted', "Matériel « {$materiel->nom} » ({$materiel->code}) mis à la corbeille", $materiel);
        $materiel->delete();

        return redirect()->route('materiel.inventaire.index')->with('status', 'Matériel placé dans la corbeille.');
    }

    public function export(): BinaryFileResponse
    {
        $rows = Materiel::orderBy('code')->get()->map(fn (Materiel $materiel) => [
            $materiel->code,
            $materiel->nom,
            Materiel::CATEGORIES[$materiel->categorie] ?? $materiel->categorie,
            $materiel->marque,
            $materiel->modele,
            $materiel->numero_serie,
            $materiel->statut->label(),
            $materiel->localisation,
            $materiel->date_acquisition?->format('d/m/Y'),
            $materiel->valeur,
        ]);

        return XlsxWriter::download('materiel_'.now()->format('Y-m-d').'.xlsx', 'Inventaire', [
            'Code', 'Désignation', 'Catégorie', 'Marque', 'Modèle', 'N° de série', 'Statut', 'Localisation', 'Date d\'acquisition', 'Valeur (Ar)',
        ], $rows);
    }

    /**
     * @return array<string, mixed>
     */
    public static function present(Materiel $materiel): array
    {
        $emprunt = $materiel->relationLoaded('empruntEnCours') ? $materiel->empruntEnCours : null;
        $intervention = $materiel->relationLoaded('interventionOuverte') ? $materiel->interventionOuverte : null;

        return [
            'id' => $materiel->id,
            'code' => $materiel->code,
            'nom' => $materiel->nom,
            'categorie' => $materiel->categorie,
            'marque' => $materiel->marque,
            'modele' => $materiel->modele,
            'numero_serie' => $materiel->numero_serie,
            'statut' => $materiel->statut->value,
            'localisation' => $materiel->localisation,
            'date_acquisition' => $materiel->date_acquisition?->toDateString(),
            'valeur' => $materiel->valeur,
            'notes' => $materiel->notes,
            'photo_path' => $materiel->photo_path,
            'emprunt' => $emprunt ? [
                'id' => $emprunt->id,
                'emprunteur_nom' => $emprunt->emprunteur_nom,
                'date_retour_prevue' => $emprunt->date_retour_prevue->toDateString(),
                'en_retard' => $emprunt->isEnRetard(),
            ] : null,
            'intervention' => $intervention ? [
                'id' => $intervention->id,
                'type' => $intervention->type,
                'titre' => $intervention->titre,
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function presentEmprunt(MaterielEmprunt $emprunt): array
    {
        return [
            'id' => $emprunt->id,
            'materiel_id' => $emprunt->materiel_id,
            'emprunteur_nom' => $emprunt->emprunteur_nom,
            'emprunteur_type' => $emprunt->emprunteur_type,
            'emprunteur_reference' => $emprunt->emprunteur_reference,
            'emprunteur_contact' => $emprunt->emprunteur_contact,
            'motif' => $emprunt->motif,
            'date_sortie' => $emprunt->date_sortie->toDateString(),
            'date_retour_prevue' => $emprunt->date_retour_prevue->toDateString(),
            'date_retour_effective' => $emprunt->date_retour_effective?->toDateString(),
            'etat_au_retour' => $emprunt->etat_au_retour,
            'note_retour' => $emprunt->note_retour,
            'en_retard' => $emprunt->isEnRetard(),
            'jours_retard' => $emprunt->isEnRetard() ? (int) $emprunt->date_retour_prevue->diffInDays(today()) : 0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function presentIntervention(MaterielIntervention $intervention): array
    {
        return [
            'id' => $intervention->id,
            'materiel_id' => $intervention->materiel_id,
            'type' => $intervention->type,
            'titre' => $intervention->titre,
            'description' => $intervention->description,
            'date_debut' => $intervention->date_debut->toDateString(),
            'date_fin' => $intervention->date_fin?->toDateString(),
            'prestataire' => $intervention->prestataire,
            'cout' => $intervention->cout,
            'resolution' => $intervention->resolution,
            'signale_par' => $intervention->signaleur?->name,
            'ouverte' => $intervention->isOuverte(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function options(): array
    {
        return [
            'categories' => Materiel::CATEGORIES,
            'statuts' => collect(MaterielStatut::cases())->mapWithKeys(fn (MaterielStatut $statut) => [$statut->value => $statut->label()])->all(),
            'emprunteur_types' => MaterielEmprunt::EMPRUNTEUR_TYPES,
            'etats_retour' => MaterielEmprunt::ETATS_RETOUR,
            'intervention_types' => MaterielIntervention::TYPES,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Materiel $materiel = null): array
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:40', Rule::unique('materiels', 'code')->ignore($materiel?->id)],
            'nom' => ['required', 'string', 'max:150'],
            'categorie' => ['required', Rule::in(array_keys(Materiel::CATEGORIES))],
            'marque' => ['nullable', 'string', 'max:100'],
            'modele' => ['nullable', 'string', 'max:100'],
            'numero_serie' => ['nullable', 'string', 'max:100'],
            'localisation' => ['nullable', 'string', 'max:150'],
            'date_acquisition' => ['nullable', 'date', 'before_or_equal:today'],
            'valeur' => ['nullable', 'integer', 'min:0', 'max:10000000000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        // The upload itself is stored separately; only its path is kept on the model.
        unset($validated['photo']);

        return $validated;
    }

    private function storePhoto(Request $request): ?string
    {
        return $request->hasFile('photo') ? 'storage/'.$request->file('photo')->store('materiel', 'public') : null;
    }

    private function deletePhoto(?string $path): void
    {
        if ($path !== null && Str::startsWith($path, 'storage/materiel/')) {
            Storage::disk('public')->delete(Str::after($path, 'storage/'));
        }
    }
}
