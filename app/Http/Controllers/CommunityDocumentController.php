<?php

namespace App\Http\Controllers;

use App\CommunityDocumentStatus;
use App\Http\Requests\StoreCommunityDocumentRequest;
use App\Models\ActivityLog;
use App\Models\Classe;
use App\Models\CommunityDocument;
use App\Models\Filiere;
use App\Models\User;
use App\Notifications\CommunityDocumentSubmitted;
use App\Services\ConversationListBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Leçons" and "Sujets" — the community feed's two upload-and-moderate
 * sidebar sections (see Communaute/Index.jsx). Same shape, same controller,
 * only the `category` column differs — split into two pages only on the
 * frontend route, not into two models.
 */
class CommunityDocumentController extends Controller
{
    public function lecons(Request $request): Response
    {
        return $this->renderCategory($request, 'lecon');
    }

    public function sujets(Request $request): Response
    {
        return $this->renderCategory($request, 'sujet');
    }

    private function renderCategory(Request $request, string $category): Response
    {
        $user = $request->user();
        $canModerate = $user->can('lecons-sujets.moderate');

        $documents = CommunityDocument::query()
            ->where('category', $category)
            ->with(['user:id,name,avatar_path', 'filieres:id,nom_fr'])
            ->where(function ($query) use ($user, $canModerate) {
                $query->where('status', CommunityDocumentStatus::Valide)
                    ->orWhere('user_id', $user->id);

                if ($canModerate) {
                    $query->orWhere('status', CommunityDocumentStatus::EnAttente);
                }
            })
            ->latest()
            ->get()
            ->map(fn (CommunityDocument $document) => [
                'id' => $document->id,
                'title' => $document->title,
                'file_path' => $document->file_path,
                'status' => $document->status->value,
                'status_label' => $document->status->label(),
                'rejection_reason' => $document->rejection_reason,
                'is_mine' => $document->user_id === $user->id,
                'filiere_ids' => $document->filieres->pluck('id'),
                'filiere_noms' => $document->filieres->pluck('nom_fr'),
                'niveaux' => $document->niveaux ?? [],
                'annee' => $document->annee,
                'extension' => strtoupper(pathinfo($document->file_path, PATHINFO_EXTENSION)),
                'user' => ['id' => $document->user->id, 'name' => $document->user->name, 'avatar_path' => $document->user->avatar_path],
                'created_at' => $document->created_at,
            ]);

        return Inertia::render('Communaute/Documents', [
            'category' => $category,
            'documents' => $documents,
            'canModerate' => $canModerate,
            'filieres' => Filiere::orderBy('nom_fr')->get(['id', 'nom_fr']),
            'annees' => $this->selectableYears(),
            'conversations' => fn () => app(ConversationListBuilder::class)->forUser($user)->values(),
        ]);
    }

    /**
     * The current academic year (see Classe::currentYear()) plus the two
     * before it — enough to tag or filter a lesson/sujet by année without a
     * free-text field that would fragment into inconsistent values.
     *
     * @return array<int, string>
     */
    private function selectableYears(): array
    {
        $current = (int) Classe::currentYear();

        return [(string) $current, (string) ($current - 1), (string) ($current - 2)];
    }

    public function store(StoreCommunityDocumentRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $autoApprove = $user->can('lecons-sujets.moderate');

        $document = CommunityDocument::create([
            'user_id' => $user->id,
            'category' => $validated['category'],
            'niveaux' => $validated['niveaux'] ?? [],
            'annee' => $validated['annee'] ?? null,
            'title' => $validated['title'],
            'file_path' => $this->storeUploadedFile($request),
            'status' => $autoApprove ? CommunityDocumentStatus::Valide : CommunityDocumentStatus::EnAttente,
            'validated_by' => $autoApprove ? $user->id : null,
            'validated_at' => $autoApprove ? now() : null,
        ]);

        $document->filieres()->sync($validated['filiere_ids'] ?? []);

        if (! $autoApprove) {
            Notification::send(User::permission('lecons-sujets.moderate')->get(), new CommunityDocumentSubmitted($document));
        }

        return back()->with('status', $autoApprove ? 'Fichier publié.' : "Fichier envoyé, en attente de validation par l'administrateur.");
    }

    public function update(Request $request, CommunityDocument $communityDocument): RedirectResponse
    {
        abort_unless($communityDocument->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'filiere_ids' => ['nullable', 'array'],
            'filiere_ids.*' => ['integer', 'exists:filieres,id'],
            'niveaux' => ['nullable', 'array'],
            'niveaux.*' => [Rule::in(['L1', 'L2', 'L3', 'M1', 'M2'])],
            'annee' => ['nullable', 'digits:4'],
            'file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp,gif,bmp,svg,heic,heif,avif,tiff'],
        ]);

        $filiereIds = $validated['filiere_ids'] ?? [];
        unset($validated['filiere_ids']);
        $validated['niveaux'] = $validated['niveaux'] ?? [];

        // An edited file goes back through moderation — it's no longer the
        // content a moderator already reviewed.
        $validated['status'] = CommunityDocumentStatus::EnAttente;
        $validated['rejection_reason'] = null;
        $validated['validated_by'] = null;
        $validated['validated_at'] = null;

        if ($request->hasFile('file')) {
            $this->deleteUploadedFile($communityDocument->file_path);
            $validated['file_path'] = $this->storeUploadedFile($request);
        }

        $communityDocument->update($validated);
        $communityDocument->filieres()->sync($filiereIds);

        return back()->with('status', 'Fichier mis à jour, en attente de validation.');
    }

    public function destroy(Request $request, CommunityDocument $communityDocument): RedirectResponse
    {
        abort_unless($communityDocument->user_id === $request->user()->id, 403);

        $communityDocument->delete();

        return back()->with('status', 'Fichier supprimé.');
    }

    public function approve(Request $request, CommunityDocument $communityDocument): RedirectResponse
    {
        abort_unless($communityDocument->status === CommunityDocumentStatus::EnAttente, 409, "Ce fichier n'est pas en attente de validation.");

        $communityDocument->update([
            'status' => CommunityDocumentStatus::Valide,
            'rejection_reason' => null,
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        ActivityLog::record('community_document_validated', "Fichier « {$communityDocument->title} » validé", $communityDocument);

        return back()->with('status', 'Fichier validé.');
    }

    public function reject(Request $request, CommunityDocument $communityDocument): RedirectResponse
    {
        abort_unless($communityDocument->status === CommunityDocumentStatus::EnAttente, 409, "Ce fichier n'est pas en attente de validation.");

        $validated = $request->validate(['rejection_reason' => ['nullable', 'string', 'max:500']]);

        $communityDocument->update([
            'status' => CommunityDocumentStatus::Rejete,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        ActivityLog::record('community_document_rejected', "Fichier « {$communityDocument->title} » rejeté", $communityDocument, ['reason' => $validated['rejection_reason'] ?? null]);

        return back()->with('status', 'Fichier rejeté.');
    }

    private function storeUploadedFile(Request $request): string
    {
        return 'storage/'.$request->file('file')->store('lecons-sujets', 'public');
    }

    private function deleteUploadedFile(?string $path): void
    {
        if ($path !== null && Str::startsWith($path, 'storage/lecons-sujets/')) {
            Storage::disk('public')->delete(Str::after($path, 'storage/'));
        }
    }
}
