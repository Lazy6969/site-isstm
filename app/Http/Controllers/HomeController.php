<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\SectionVisibilityController;
use App\Models\Filiere;
use App\Models\HeroSlide;
use App\Models\NewsArticle;
use App\Models\Partenaire;
use App\Models\Testimonial;
use App\NewsStatus;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale();

        return Inertia::render('Home', [
            'hiddenSections' => SectionVisibilityController::hidden(),
            'heroSlides' => HeroSlide::orderBy('display_order')->get(['image_path', 'media_type']),
            'testimonials' => Testimonial::orderBy('display_order')
                ->get(['author_name', 'program', 'image_path', 'quote_fr', 'quote_en', 'quote_mg'])
                ->map(fn (Testimonial $item) => [
                    'author_name' => $item->author_name,
                    'program' => $item->program,
                    'image_path' => $item->image_path,
                    'quote' => $item->{"quote_{$locale}"} ?: $item->quote_fr,
                ]),
            'filieres' => Filiere::orderBy('display_order')
                ->take(8)
                ->get(['slug', 'mention', 'nom_fr', 'nom_en', 'nom_mg', 'description_fr', 'description_en', 'description_mg', 'image_path'])
                ->map(fn (Filiere $item) => [
                    'slug' => $item->slug,
                    'mention' => $item->mention,
                    'nom' => $item->{"nom_{$locale}"} ?: $item->nom_fr,
                    'description' => $item->{"description_{$locale}"} ?: $item->description_fr,
                    'image_path' => $item->image_path,
                ]),
            'partenaires' => Partenaire::orderBy('display_order')->get(['nom', 'logo_path', 'site_url']),
            'actualites' => NewsArticle::query()
                ->with('category:id,name_fr,color')
                ->where('status', NewsStatus::Publie)
                ->orderByDesc('published_at')
                ->take(3)
                ->get(['id', 'news_category_id', 'title', 'slug', 'excerpt', 'image_path', 'published_at'])
                ->map(fn (NewsArticle $item) => [
                    'slug' => $item->slug,
                    'title' => $item->title,
                    'excerpt' => $item->excerpt,
                    'image_path' => $item->image_path,
                    'published_at' => $item->published_at,
                    'category' => $item->category?->name_fr,
                    'category_color' => $item->category?->color,
                ]),
        ]);
    }
}
