<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrgDocumentController extends Controller
{
    /**
     * Fixed title for each of the Parcours page's document slots — the
     * page's own heading/description text stays admin-editable through the
     * usual quick-edit SiteContent keys; this is only the internal label
     * stored on the Document row itself. Each of the 2 documents
     * (organigramme/cursus) offers 3 format slots (pdf/word/image), mirroring
     * the legacy site's download section.
     *
     * @var array<string, string>
     */
    private const TITLES = [
        'organigramme_pdf' => "Organigramme complet de l'ISSTM (PDF)",
        'organigramme_word' => "Organigramme complet de l'ISSTM (Word)",
        'organigramme_image' => "Organigramme complet de l'ISSTM (Image)",
        'cursus_pdf' => 'Grille des cursus (PDF)',
        'cursus_word' => 'Grille des cursus (Word)',
        'cursus_image' => 'Grille des cursus (Image)',
    ];

    public function upload(Request $request, string $slug): RedirectResponse
    {
        abort_unless(array_key_exists($slug, self::TITLES), 404);

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
        ]);

        $existing = Document::where('slug', $slug)->first();
        if ($existing && Str::startsWith($existing->file_path, 'storage/documents/')) {
            Storage::disk('public')->delete(Str::after($existing->file_path, 'storage/'));
        }

        $path = 'storage/'.$request->file('file')->store('documents', 'public');

        Document::updateOrCreate(
            ['slug' => $slug],
            [
                'title' => self::TITLES[$slug],
                'category' => 'etudiant',
                'file_path' => $path,
            ],
        );

        return back()->with('status', 'Document mis à jour.');
    }
}
