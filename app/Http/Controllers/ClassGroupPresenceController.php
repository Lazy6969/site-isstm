<?php

namespace App\Http\Controllers;

use App\GroupMemberRole;
use App\Http\Requests\StorePresenceRequest;
use App\Models\ClassGroup;
use App\Models\ClassGroupMember;
use App\Models\ClassGroupPresenceSession;
use App\PresenceStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassGroupPresenceController extends Controller
{
    public function index(Request $request, ClassGroup $group): Response
    {
        $user = $request->user();
        $membership = $group->memberFor($user);
        abort_if($membership === null || ! $membership->canDownloadPresence(), 403);

        $students = ClassGroupMember::query()
            ->where('class_group_id', $group->id)
            ->where('role_in_group', GroupMemberRole::Etudiant)
            ->where('is_banned', false)
            ->with('user')
            ->get()
            ->map(fn (ClassGroupMember $m) => ['id' => $m->user_id, 'name' => $m->user->name]);

        $sessions = ClassGroupPresenceSession::query()
            ->where('class_group_id', $group->id)
            ->with('marks')
            ->orderByDesc('session_date')
            ->get()
            ->map(fn (ClassGroupPresenceSession $session) => [
                'id' => $session->id,
                'session_date' => $session->session_date->toDateString(),
                'present_ids' => $session->marks->where('status', PresenceStatus::Present)->pluck('user_id')->values(),
            ]);

        return Inertia::render('Groupes/Presence', [
            'group' => ['id' => $group->id, 'name' => $group->name],
            'canMark' => $membership->canModerate(),
            'students' => $students,
            'sessions' => $sessions,
        ]);
    }

    public function store(StorePresenceRequest $request, ClassGroup $group): RedirectResponse
    {
        $membership = $group->memberFor($request->user());
        abort_if($membership === null || ! $membership->canModerate(), 403);

        $session = ClassGroupPresenceSession::query()->updateOrCreate(
            ['class_group_id' => $group->id, 'session_date' => $request->validated('session_date')],
            ['created_by' => $request->user()->id],
        );

        $presentIds = collect($request->validated('present_user_ids', []))->map(fn ($id) => (int) $id);

        $students = ClassGroupMember::query()
            ->where('class_group_id', $group->id)
            ->where('role_in_group', GroupMemberRole::Etudiant)
            ->where('is_banned', false)
            ->pluck('user_id');

        foreach ($students as $studentId) {
            $session->marks()->updateOrCreate(
                ['user_id' => $studentId],
                ['status' => $presentIds->contains($studentId) ? PresenceStatus::Present : PresenceStatus::Absent],
            );
        }

        return back()->with('status', 'Présence enregistrée.');
    }
}
