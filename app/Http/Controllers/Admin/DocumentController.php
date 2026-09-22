<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Documents/Index', [
            'documents' => Document::orderByDesc('created_at')->get(['id', 'title', 'category', 'file_path', 'created_at']),
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['file_path'] = $this->storeUploadedFile($request);
        unset($validated['file']);

        Document::create($validated);

        return back()->with('status', 'Document ajouté.');
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(['public', 'etudiant'])],
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx', 'max:10240'],
        ]);

        if ($request->hasFile('file')) {
            $this->deleteUploadedFile($document->file_path);
            $validated['file_path'] = $this->storeUploadedFile($request);
        }
        unset($validated['file']);

        $document->update($validated);

        return back()->with('status', 'Document mis à jour.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        $this->deleteUploadedFile($document->file_path);
        $document->delete();

        return back()->with('status', 'Document supprimé.');
    }

    private function storeUploadedFile(Request $request): string
    {
        return 'storage/'.$request->file('file')->store('documents', 'public');
    }

    private function deleteUploadedFile(?string $path): void
    {
        if ($path !== null && Str::startsWith($path, 'storage/documents/')) {
            Storage::disk('public')->delete(Str::after($path, 'storage/'));
        }
    }
}
