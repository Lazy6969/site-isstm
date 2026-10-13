<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Setting;
use App\Models\SiteContent;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InscriptionController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        // Closed either by its own toggle, or by the broader "Admissions
        // fermées" status — the fees/requirements info stays tied to
        // whether admissions are actually open, same as the forms.
        if (Setting::get('inscriptions.closed', 'false') === 'true' || Setting::get('admissions.open', 'true') === 'false') {
            return redirect()->route('rejoindre')->with(
                'status',
                Setting::get('inscriptions.closed_message') ?: 'Les inscriptions sont actuellement fermées.',
            );
        }

        $content = SiteContent::all()->keyBy('content_key')
            ->map(fn (SiteContent $item) => $item->content_value_fr);

        return Inertia::render('Inscription/Index', [
            'content' => $content,
            'dossierPreinscription' => Document::where('slug', 'dossier_preinscription')->value('file_path'),
        ]);
    }
}
