<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class InscriptionController extends Controller
{
    public function index(): Response
    {
        $content = SiteContent::all()->keyBy('content_key')
            ->map(fn (SiteContent $item) => $item->content_value_fr);

        return Inertia::render('Inscription/Index', ['content' => $content]);
    }
}
