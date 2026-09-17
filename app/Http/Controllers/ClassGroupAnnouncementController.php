<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassGroupAnnouncementRequest;
use App\Models\ClassGroup;
use App\Models\ClassGroupAnnouncement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ClassGroupAnnouncementController extends Controller
{
    public function store(StoreClassGroupAnnouncementRequest $request, ClassGroup $group): RedirectResponse
    {
        $membership = $group->memberFor($request->user());
        abort_if($membership === null || ! $membership->canModerate(), 403);

        $group->announcements()->create([
            ...$request->validated(),
            'teacher_id' => $request->user()->id,
        ]);

        return back()->with('status', 'Annonce publiée.');
    }

    public function destroy(Request $request, ClassGroupAnnouncement $announcement): RedirectResponse
    {
        $membership = $announcement->classGroup->memberFor($request->user());
        abort_if($membership === null || ! $membership->canModerate(), 403);

        $announcement->delete();

        return back()->with('status', 'Annonce supprimée.');
    }
}
