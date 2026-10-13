<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Looks up the Document a tracked link points at (by its stored `file_path`)
 * and returns the absolute path of its file. Aborts when the document is
 * unknown, student-only without a login, or its file is missing/outside public/.
 */
trait ResolvesTrackedDocument
{
    /**
     * @return array{0: Document, 1: string}
     */
    protected function resolveTrackedDocument(Request $request): array
    {
        $filePath = (string) ($request->query('fichier') ?? $request->input('fichier', ''));

        $document = Document::where('file_path', ltrim($filePath, '/'))->first();
        abort_if($document === null, 404);
        abort_if($document->category === 'etudiant' && ! $request->user(), 403);

        $absolute = public_path($document->file_path);
        abort_unless(
            Str::startsWith(realpath($absolute) ?: '', realpath(public_path()) ?: "\0") && is_file($absolute),
            404,
        );

        return [$document, $absolute];
    }
}
