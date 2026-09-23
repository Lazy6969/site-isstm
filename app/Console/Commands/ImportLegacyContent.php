<?php

namespace App\Console\Commands;

use App\GalleryStatus;
use App\Models\Document;
use App\Models\GalleryAlbum;
use App\Models\GalleryPhoto;
use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\NewsStatus;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * One-off import of real gallery/news/document rows from the legacy PHP
 * site's database (github.com/Lazy6969/ISSTM, `legacy_isstm` connection)
 * into this app's own tables — the two share near-identical schemas, but
 * only the legacy site's admin was ever used to upload real content, so
 * this app's rows are still the seeded placeholders.
 *
 * Idempotent: every insert is gated on the row not already existing here
 * (matched by slug/title), so re-running the command is a no-op.
 */
#[Signature('app:import-legacy-content')]
#[Description('Import real gallery, news, and document rows from the legacy ISSTM database')]
class ImportLegacyContent extends Command
{
    private const LEGACY_UPLOADS_URL_PREFIX = 'images/legacy';

    public function handle(): int
    {
        $legacy = DB::connection('legacy_isstm');

        $this->importGalleryAlbumsAndPhotos($legacy);
        $this->importDocuments($legacy);
        $this->importNewsCategories($legacy);
        $this->importNewsArticles($legacy);

        return self::SUCCESS;
    }

    private function importGalleryAlbumsAndPhotos(Connection $legacy): void
    {
        $existingTitles = GalleryAlbum::pluck('title')->all();

        $albums = $legacy->table('gallery_albums')
            ->where('cover_image', 'like', 'uploads/%')
            ->get();

        foreach ($albums as $legacyAlbum) {
            if (in_array($legacyAlbum->title_fr, $existingTitles, true)) {
                $this->line("Skipping album already present: {$legacyAlbum->title_fr}");

                continue;
            }

            $album = GalleryAlbum::create([
                'gallery_category_id' => $legacyAlbum->category_id,
                'title' => $legacyAlbum->title_fr,
                'slug' => $this->uniqueSlug($legacyAlbum->title_fr, GalleryAlbum::class),
                'description' => $legacyAlbum->description_fr,
                'cover_image' => $this->remapPath($legacyAlbum->cover_image),
                'event_date' => $legacyAlbum->event_date,
                'location' => $legacyAlbum->location,
                'author' => $legacyAlbum->author,
                'status' => GalleryStatus::from($legacyAlbum->status),
                'published_at' => $legacyAlbum->published_at,
            ]);

            $this->info("Imported album: {$album->title}");

            $photos = $legacy->table('gallery_photos')
                ->where('album_id', $legacyAlbum->id)
                ->where('image_path', 'like', 'uploads/%')
                ->orderBy('id')
                ->get();

            foreach ($photos as $index => $legacyPhoto) {
                GalleryPhoto::create([
                    'gallery_album_id' => $album->id,
                    'image_path' => $this->remapPath($legacyPhoto->image_path),
                    'title' => $legacyPhoto->title,
                    'alt_text' => $legacyPhoto->alt_text,
                    'display_order' => $legacyPhoto->display_order ?? $index,
                ]);
            }

            $this->info("  imported {$photos->count()} photos");
        }
    }

    private function importDocuments(Connection $legacy): void
    {
        $existingTitles = Document::pluck('title')->all();

        $documents = $legacy->table('documents')->get();

        foreach ($documents as $legacyDocument) {
            if (in_array($legacyDocument->title, $existingTitles, true)) {
                $this->line("Skipping document already present: {$legacyDocument->title}");

                continue;
            }

            Document::create([
                'title' => $legacyDocument->title,
                'category' => $legacyDocument->category,
                'file_path' => $this->remapPath($legacyDocument->file_path, 'documents'),
            ]);

            $this->info("Imported document: {$legacyDocument->title}");
        }
    }

    private function importNewsCategories(Connection $legacy): void
    {
        $existingSlugs = NewsCategory::pluck('slug')->all();

        $categories = $legacy->table('news_categories')->get();

        foreach ($categories as $legacyCategory) {
            if (in_array($legacyCategory->slug, $existingSlugs, true)) {
                continue;
            }

            NewsCategory::create([
                'slug' => $legacyCategory->slug,
                'name_fr' => $legacyCategory->name_fr,
                'icon' => $legacyCategory->icon,
                'display_order' => $legacyCategory->display_order,
            ]);

            $this->info("Imported news category: {$legacyCategory->name_fr}");
        }
    }

    private function importNewsArticles(Connection $legacy): void
    {
        $existingSlugs = NewsArticle::pluck('slug')->all();
        $categoryIdBySlug = NewsCategory::pluck('id', 'slug');

        $articles = $legacy->table('news_articles')->get();

        foreach ($articles as $legacyArticle) {
            if (in_array($legacyArticle->slug, $existingSlugs, true)) {
                continue;
            }

            $legacyCategorySlug = $legacy->table('news_categories')
                ->where('id', $legacyArticle->category_id)
                ->value('slug');

            $imagePath = str_starts_with((string) $legacyArticle->image_path, 'uploads/')
                ? $this->remapPath($legacyArticle->image_path)
                : $legacyArticle->image_path;

            NewsArticle::create([
                'news_category_id' => $categoryIdBySlug[$legacyCategorySlug] ?? null,
                'title' => $legacyArticle->title_fr,
                'slug' => $legacyArticle->slug,
                'excerpt' => $legacyArticle->excerpt_fr,
                'content' => $legacyArticle->content_fr,
                'image_path' => $imagePath,
                'author' => $legacyArticle->author,
                'status' => NewsStatus::from($legacyArticle->status),
                'is_featured' => (bool) $legacyArticle->is_featured,
                'views' => $legacyArticle->views ?? 0,
                'published_at' => $legacyArticle->published_at,
            ]);

            $this->info("Imported news article: {$legacyArticle->title_fr}");
        }
    }

    private function remapPath(string $legacyPath, string $folder = 'galerie'): string
    {
        return self::LEGACY_UPLOADS_URL_PREFIX.'/'.$folder.'/'.basename($legacyPath);
    }

    private function uniqueSlug(string $title, string $modelClass): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 2;

        while ($modelClass::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
