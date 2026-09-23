<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsArticleRequest;
use App\Models\ActivityLog;
use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\NewsStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NewsArticleController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Actualites/Index', [
            'articles' => NewsArticle::with(['category:id,name_fr,color', 'validator:id,name'])
                ->orderByDesc('created_at')
                ->get(['id', 'news_category_id', 'title', 'slug', 'excerpt', 'content', 'image_path', 'author', 'status', 'rejection_reason', 'validated_by', 'validated_at', 'is_featured', 'published_at', 'created_at']),
            'categories' => NewsCategory::orderBy('name_fr')->get(['id', 'name_fr', 'color']),
        ]);
    }

    /**
     * Batched rather than one request per category — an admin picking colors
     * for all 15 seeded categories shouldn't fire 15 separate saves.
     */
    public function updateCategoryColors(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'colors' => ['required', 'array'],
            'colors.*' => ['nullable', 'regex:/^#[0-9a-f]{6}$/i'],
        ]);

        foreach ($validated['colors'] as $categoryId => $color) {
            NewsCategory::whereKey($categoryId)->update(['color' => $color ?: null]);
        }

        return back()->with('status', 'Couleurs des catégories mises à jour.');
    }

    public function store(StoreNewsArticleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['status'] = NewsStatus::from($validated['status']);
        $validated['is_featured'] = $request->boolean('is_featured');

        $this->applyValidationWorkflow($request, $validated);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'news');
        }
        unset($validated['image']);

        NewsArticle::create($validated);

        return back()->with('status', $validated['status'] === NewsStatus::EnAttente ? 'Article soumis pour validation.' : 'Article créé.');
    }

    public function update(Request $request, NewsArticle $article): RedirectResponse
    {
        $validated = $request->validate([
            'news_category_id' => ['nullable', 'exists:news_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'author' => ['nullable', 'string', 'max:150'],
            'status' => ['required', Rule::enum(NewsStatus::class)],
            'is_featured' => ['boolean'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $validated['status'] = NewsStatus::from($validated['status']);
        $validated['is_featured'] = $request->boolean('is_featured');

        $this->applyValidationWorkflow($request, $validated, $article);

        if ($request->hasFile('image')) {
            $this->deleteUploadedImage($article->image_path, 'news');
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'news');
        }
        unset($validated['image']);

        $article->update($validated);

        return back()->with('status', $validated['status'] === NewsStatus::EnAttente ? 'Article soumis pour validation.' : 'Article mis à jour.');
    }

    public function approve(Request $request, NewsArticle $article): RedirectResponse
    {
        abort_unless($article->status === NewsStatus::EnAttente, 409, "Cet article n'est pas en attente de validation.");

        $article->update([
            'status' => NewsStatus::Publie,
            'rejection_reason' => null,
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
            'published_at' => $article->published_at ?? now(),
        ]);

        ActivityLog::record('news_validated', "Article « {$article->title} » validé et publié", $article);

        return back()->with('status', 'Article validé et publié.');
    }

    public function reject(Request $request, NewsArticle $article): RedirectResponse
    {
        abort_unless($article->status === NewsStatus::EnAttente, 409, "Cet article n'est pas en attente de validation.");

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $article->update([
            'status' => NewsStatus::Rejete,
            'rejection_reason' => $validated['rejection_reason'],
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        ActivityLog::record('news_rejected', "Article « {$article->title} » rejeté", $article, ['reason' => $validated['rejection_reason']]);

        return back()->with('status', 'Article rejeté.');
    }

    public function destroy(NewsArticle $article): RedirectResponse
    {
        $this->deleteUploadedImage($article->image_path, 'news');
        $article->delete();

        return back()->with('status', 'Article supprimé.');
    }

    /**
     * A creator/editor without `news.publish` cannot take an article straight to
     * Publié/Archivé/Rejeté — anything but Brouillon gets downgraded to En attente
     * for a publisher to review. Mutates $validated in place.
     *
     * @param  array<string, mixed>  $validated
     */
    private function applyValidationWorkflow(Request $request, array &$validated, ?NewsArticle $article = null): void
    {
        if ($request->user()->can('news.publish')) {
            if ($validated['status'] === NewsStatus::Publie && $article?->published_at === null) {
                $validated['published_at'] = now();
            }
            if ($validated['status'] === NewsStatus::Publie) {
                $validated['validated_by'] = $request->user()->id;
                $validated['validated_at'] = now();
                $validated['rejection_reason'] = null;
            }

            return;
        }

        if ($validated['status'] !== NewsStatus::Brouillon) {
            $validated['status'] = NewsStatus::EnAttente;
            $validated['rejection_reason'] = null;
        }
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 1;

        while (NewsArticle::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
