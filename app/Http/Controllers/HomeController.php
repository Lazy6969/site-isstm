<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use App\Models\HeroSlide;
use App\Models\SiteContent;
use App\Models\Testimonial;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $content = SiteContent::all()->keyBy('content_key')
            ->map(fn (SiteContent $item) => $item->content_value_fr);

        return Inertia::render('Home', [
            'content' => $content,
            'heroSlides' => HeroSlide::orderBy('display_order')->get(['image_path', 'media_type']),
            'testimonials' => Testimonial::orderBy('display_order')->get([
                'author_name', 'program', 'image_path', 'quote_fr as quote',
            ]),
            'filieres' => Filiere::orderBy('display_order')->get([
                'slug', 'mention', 'nom_fr as nom', 'description_fr as description', 'image_path',
            ]),
        ]);
    }
}
