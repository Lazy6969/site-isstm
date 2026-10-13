<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentDownload;
use Inertia\Inertia;
use Inertia\Response;

class DocumentDownloadController extends Controller
{
    public function index(): Response
    {
        $downloads = DocumentDownload::with(['document:id,title,category,file_path,deleted_at', 'user:id,name,email,role'])
            ->latest()
            ->limit(300)
            ->get()
            ->map(fn (DocumentDownload $download) => [
                'id' => $download->id,
                'document_title' => $download->document?->title,
                'document_category' => $download->document?->category,
                'user_name' => $download->user?->name,
                'user_email' => $download->user?->email,
                'ip_address' => $download->ip_address,
                'created_at' => $download->created_at,
            ]);

        $documents = Document::query()
            ->withCount(['downloads', 'views', 'shares'])
            ->get(['id', 'title', 'category', 'file_path'])
            ->map(fn (Document $document) => [
                'id' => $document->id,
                'title' => $document->title,
                'category' => $document->category,
                'file_path' => $document->file_path,
                'downloads_count' => $document->downloads_count,
                'views_count' => $document->views_count,
                'shares_count' => $document->shares_count,
                'unique_downloaders' => $document->downloads()->whereNotNull('user_id')->distinct()->count('user_id'),
                'last_downloaded_at' => $document->downloads()->max('created_at'),
            ])
            ->sortByDesc('downloads_count')
            ->values();

        return Inertia::render('Admin/Documents/Downloads', [
            'downloads' => $downloads,
            'documents' => $documents,
            'daily' => $this->dailyCounts(14),
            'stats' => [
                'total' => DocumentDownload::count(),
                'today' => DocumentDownload::whereDate('created_at', today())->count(),
                'last_7_days' => DocumentDownload::where('created_at', '>=', now()->subDays(7))->count(),
                'identified_users' => DocumentDownload::whereNotNull('user_id')->distinct()->count('user_id'),
                'anonymous' => DocumentDownload::whereNull('user_id')->count(),
            ],
        ]);
    }

    /**
     * Downloads per day over the last $days days, oldest first, zero-filled.
     *
     * @return array<int, array{date: string, count: int}>
     */
    private function dailyCounts(int $days): array
    {
        $start = today()->subDays($days - 1);

        $counts = DocumentDownload::where('created_at', '>=', $start)
            ->get(['created_at'])
            ->countBy(fn (DocumentDownload $download) => $download->created_at->toDateString());

        return collect(range(0, $days - 1))
            ->map(fn (int $offset) => $start->copy()->addDays($offset)->toDateString())
            ->map(fn (string $date) => ['date' => $date, 'count' => (int) ($counts[$date] ?? 0)])
            ->all();
    }
}
