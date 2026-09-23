<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SiteContent;
use App\Models\SiteContentRevision;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteContentRevisionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Contenu/Historique', [
            'revisions' => SiteContentRevision::with('user:id,name')
                ->latest('created_at')
                ->limit(200)
                ->get(['id', 'site_content_id', 'content_key', 'type', 'content_value_fr', 'content_value_en', 'content_value_mg', 'changed_by', 'created_at']),
        ]);
    }

    /**
     * Roll the content back to this revision's snapshot — itself snapshotted
     * first, so restoring is never a one-way trip.
     */
    public function restore(Request $request, SiteContentRevision $revision): RedirectResponse
    {
        $content = SiteContent::where('content_key', $revision->content_key)->firstOrFail();

        abort_unless($request->user()->can($content->type->permission()), 403);

        SiteContentRevision::snapshot($content, $request->user());

        $content->update([
            'content_value_fr' => $revision->content_value_fr,
            'content_value_en' => $revision->content_value_en,
            'content_value_mg' => $revision->content_value_mg,
        ]);

        ActivityLog::record('content_restored', "Contenu « {$content->content_key} » restauré à une version antérieure", $content);

        return back()->with('status', 'Version restaurée.');
    }
}
