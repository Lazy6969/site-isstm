<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsArticleRequest;
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
            'articles' => NewsArticle::with('category:id,name_fr')
                ->orderByDesc('created_at')
                ->get(['id', 'news_category_id', 'title', 'slug', 'excerpt', 'content', 'image_path', 'author', 'status', 'is_featured', 'published_at', 'created_at']),
            'categories' => NewsCategory::orderBy('name_fr')->get(['id', 'name_fr']),
        ]);
    }

    public function store(StoreNewsArticleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['status'] = NewsStatus::from($validated['status']);
        $validated['is_featured'] = $request->boolean('is_featured');

        if ($validated['status'] === NewsStatus::Publie) {
            $validated['published_at'] = now();
        }

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'news');
        }
        unset($validated['image']);

        NewsArticle::create($validated);

        return back()->with('status', 'Article créé.');
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

        if ($validated['status'] === NewsStatus::Publie && $article->published_at === null) {
            $validated['published_at'] = now();
        }

        if ($request->hasFile('image')) {
            $this->deleteUploadedImage($article->image_path, 'news');
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'news');
        }
        unset($validated['image']);

        $article->update($validated);

        return back()->with('status', 'Article mis à jour.');
    }

    public function destroy(NewsArticle $article): RedirectResponse
    {
        $this->deleteUploadedImage($article->image_path, 'news');
        $article->delete();

        return back()->with('status', 'Article supprimé.');
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
