<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ActivityLog/Index', [
            'logs' => ActivityLog::query()
                ->latest('created_at')
                ->limit(200)
                ->get(['id', 'user_name', 'user_role', 'action', 'description', 'ip_address', 'created_at']),
        ]);
    }

    /**
     * Soft delete: the entry goes to the Corbeille, where it can be restored or
     * erased for good. (Every console action is also kept in the locked archive.)
     */
    public function destroy(ActivityLog $log): RedirectResponse
    {
        $log->delete();

        ActivityLog::record('activity_log_deleted', '1 entrée du journal d\'activité mise à la corbeille', null, ['ids' => [$log->id]]);

        return back()->with('status', 'Entrée placée dans la corbeille.');
    }

    public function destroyMany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:500'],
            'ids.*' => ['integer', 'exists:activity_logs,id'],
        ]);

        $count = ActivityLog::whereIn('id', $validated['ids'])->delete();

        ActivityLog::record('activity_log_deleted', "{$count} entrée(s) du journal d'activité mise(s) à la corbeille", null, ['ids' => $validated['ids']]);

        return back()->with('status', "{$count} entrée(s) placée(s) dans la corbeille.");
    }
}
