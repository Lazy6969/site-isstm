<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
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
}
