<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesTrackedDocument;
use App\Models\DocumentInteraction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * The two other tracked actions on a Document besides downloading it:
 * consulting it in the browser (a "view") and sharing its link (a "share").
 */
class DocumentInteractionController extends Controller
{
    use ResolvesTrackedDocument;

    public function view(Request $request): BinaryFileResponse
    {
        [$document, $absolute] = $this->resolveTrackedDocument($request);

        $this->record($request, $document->id, DocumentInteraction::TYPE_VIEW);

        return response()->file($absolute);
    }

    public function share(Request $request): Response
    {
        [$document] = $this->resolveTrackedDocument($request);

        $this->record($request, $document->id, DocumentInteraction::TYPE_SHARE);

        return response()->noContent();
    }

    private function record(Request $request, int $documentId, string $type): void
    {
        DocumentInteraction::create([
            'document_id' => $documentId,
            'user_id' => $request->user()?->id,
            'type' => $type,
            'ip_address' => $request->ip(),
        ]);
    }
}
