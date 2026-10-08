<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InscriptionDocumentController extends Controller
{
    private const SLUG = 'dossier_preinscription';

    private const TITLE = 'Dossier de préinscription (modèle à télécharger)';

    /**
     * Public (no login required): this is the blank form a brand-new
     * candidate downloads and fills in before they even have an account —
     * same reasoning as Document::category 'public' on the admin-managed
     * document library.
     */
    public function upload(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ]);

        $existing = Document::where('slug', self::SLUG)->first();
        if ($existing && Str::startsWith($existing->file_path, 'storage/documents/')) {
            Storage::disk('public')->delete(Str::after($existing->file_path, 'storage/'));
        }

        $path = 'storage/'.$request->file('file')->store('documents', 'public');

        Document::updateOrCreate(
            ['slug' => self::SLUG],
            ['title' => self::TITLE, 'category' => 'public', 'file_path' => $path],
        );

        return back()->with('status', 'Document mis à jour.');
    }
}
