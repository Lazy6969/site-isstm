<?php

namespace App\Http\Controllers;

use App\GroupMemberRole;
use App\Models\ClassGroupMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ClassGroupMemberController extends Controller
{
    public function ban(Request $request, ClassGroupMember $member): RedirectResponse
    {
        $this->authorizeModeration($request, $member);

        $member->update(['is_banned' => true]);

        return back()->with('status', "{$member->user->name} a été banni du groupe.");
    }

    public function unban(Request $request, ClassGroupMember $member): RedirectResponse
    {
        $this->authorizeModeration($request, $member);

        $member->update(['is_banned' => false]);

        return back()->with('status', "{$member->user->name} a été réintégré au groupe.");
    }

    public function toggleDelegate(Request $request, ClassGroupMember $member): RedirectResponse
    {
        $this->authorizeModeration($request, $member);

        $member->update(['is_delegate' => ! $member->is_delegate]);

        return back()->with('status', $member->is_delegate ? "{$member->user->name} est maintenant délégué de classe." : "{$member->user->name} n'est plus délégué.");
    }

    private function authorizeModeration(Request $request, ClassGroupMember $member): void
    {
        $membership = $member->classGroup->memberFor($request->user());

        abort_if($membership === null || ! $membership->canModerate(), 403);
        abort_if($member->role_in_group === GroupMemberRole::Enseignant, 403, 'Impossible de modérer un enseignant.');
    }
}
