<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesTrackedDocument;
use App\Models\DocumentDownload;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Tracked download of a Document: the public pages point their "Télécharger"
 * links here (with the document's stored `file_path`) instead of straight at
 * the file, so each download is recorded — who, when, from which address —
 * before the file is sent. Student-only documents still require a login.
 */
class DocumentDownloadController extends Controller
{
    use ResolvesTrackedDocument;

    public function __invoke(Request $request): BinaryFileResponse
    {
        [$document, $absolute] = $this->resolveTrackedDocument($request);

        DocumentDownload::create([
            'document_id' => $document->id,
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 250, ''),
        ]);

        return response()->download($absolute, basename($document->file_path));
    }
}
