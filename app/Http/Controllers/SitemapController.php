<?php

namespace App\Http\Controllers;

use App\Models\CampusBloc;
use App\Models\Filiere;
use App\Models\GalleryAlbum;
use App\Models\NewsArticle;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class SitemapController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        $urls = [
            ['loc' => URL::to('/'), 'priority' => '1.0'],
            ['loc' => URL::route('filieres.index'), 'priority' => '0.8'],
            ['loc' => URL::route('enseignants.index'), 'priority' => '0.6'],
            ['loc' => URL::route('campus.index'), 'priority' => '0.6'],
            ['loc' => URL::route('parcours'), 'priority' => '0.6'],
            ['loc' => URL::route('vie-etudiante'), 'priority' => '0.5'],
            ['loc' => URL::route('associations'), 'priority' => '0.5'],
            ['loc' => URL::route('bourse'), 'priority' => '0.5'],
            ['loc' => URL::route('documents.index'), 'priority' => '0.4'],
            ['loc' => URL::route('actualites.index'), 'priority' => '0.6'],
            ['loc' => URL::route('evenements.index'), 'priority' => '0.5'],
            ['loc' => URL::route('galerie.index'), 'priority' => '0.4'],
            ['loc' => URL::route('mentions-legales'), 'priority' => '0.2'],
            ['loc' => URL::route('confidentialite'), 'priority' => '0.2'],
        ];

        foreach (Filiere::pluck('slug') as $slug) {
            $urls[] = ['loc' => URL::route('filieres.show', $slug), 'priority' => '0.7'];
        }

        foreach (CampusBloc::pluck('bloc_key') as $key) {
            $urls[] = ['loc' => URL::route('campus.show', $key), 'priority' => '0.4'];
        }

        foreach (NewsArticle::where('status', 'publie')->pluck('slug') as $slug) {
            $urls[] = ['loc' => URL::route('actualites.show', $slug), 'priority' => '0.5'];
        }

        foreach (GalleryAlbum::where('status', 'publie')->pluck('slug') as $slug) {
            $urls[] = ['loc' => URL::route('galerie.show', $slug), 'priority' => '0.3'];
        }

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
