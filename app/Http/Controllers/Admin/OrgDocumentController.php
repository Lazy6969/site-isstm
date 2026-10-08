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
    public const TITLES = [
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

        // Each slot takes only its own format, so the "Word" button of the public
        // page never hands out a PDF.
        $mimes = match (Str::afterLast($slug, '_')) {
            'pdf' => 'pdf',
            'word' => 'doc,docx',
            default => 'jpg,jpeg,png',
        };

        $request->validate([
            'file' => ['required', 'file', "mimes:{$mimes}", 'max:10240'],
        ]);

        // A slot that was removed earlier is only soft-deleted, and its slug is
        // unique — bring that row back rather than trying to create a second one.
        $existing = Document::withTrashed()->where('slug', $slug)->first();
        if ($existing && Str::startsWith($existing->file_path, 'storage/documents/')) {
            Storage::disk('public')->delete(Str::after($existing->file_path, 'storage/'));
        }
        $existing?->restore();

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

    /**
     * Takes a format off the Parcours page: the slot goes back to "Document à
     * venir". The row is only soft-deleted (like everything else managed from
     * the console), so it can still be restored from the corbeille.
     */
    public function destroy(string $slug): RedirectResponse
    {
        abort_unless(array_key_exists($slug, self::TITLES), 404);

        Document::where('slug', $slug)->first()?->delete();

        return back()->with('status', 'Document retiré.');
    }
}
