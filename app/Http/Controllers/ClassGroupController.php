<?php

namespace App\Http\Controllers;

use App\GroupMemberRole;
use App\Http\Requests\JoinClassGroupRequest;
use App\Http\Requests\StoreClassGroupRequest;
use App\Models\ClassGroup;
use App\Models\ClassGroupAnnouncement;
use App\Models\ClassGroupMember;
use App\Models\ClassGroupMessage;
use App\Models\User;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassGroupController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $memberships = ClassGroupMember::query()
            ->where('user_id', $user->id)
            ->where('is_banned', false)
            ->whereHas('classGroup', fn ($query) => $query->whereNull('archived_at'))
            ->with(['classGroup.teacher', 'classGroup.filiere'])
            ->get();

        return Inertia::render('Groupes/Index', [
            'groups' => $memberships->map(fn (ClassGroupMember $membership) => $this->presentGroup($membership, $user)),
            'canCreate' => $user->hasLegacyRole(Role::Etudiant, Role::Enseignant, Role::Admin),
        ]);
    }

    public function archives(Request $request): Response
    {
        $user = $request->user();

        $memberships = ClassGroupMember::query()
            ->where('user_id', $user->id)
            ->where('is_banned', false)
            ->whereHas('classGroup', fn ($query) => $query->whereNotNull('archived_at'))
            ->with(['classGroup.teacher', 'classGroup.filiere'])
            ->get();

        return Inertia::render('Groupes/Archives', [
            'groups' => $memberships->map(fn (ClassGroupMember $membership) => $this->presentGroup($membership, $user)),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function presentGroup(ClassGroupMember $membership, User $user): array
    {
        $group = $membership->classGroup;

        return [
            'id' => $group->id,
            'name' => $group->name,
            'type' => $group->type->value,
            'type_label' => $group->type->label(),
            'annee' => $group->annee,
            'niveau' => $group->niveau,
            'filiere' => $group->filiere?->nom_fr,
            'teacher_name' => $group->teacher->name,
            'role_in_group' => $membership->role_in_group->value,
            'is_delegate' => $membership->is_delegate,
            'can_moderate' => $membership->canModerate(),
            'join_code' => $membership->role_in_group === GroupMemberRole::Enseignant ? $group->join_code : null,
            'unread_count' => $group->unreadCountFor($user, $membership->last_read_at),
        ];
    }

    public function store(StoreClassGroupRequest $request): RedirectResponse
    {
        $group = ClassGroup::create([
            ...$request->validated(),
            'join_code' => $this->generateJoinCode(),
            'teacher_id' => $request->user()->id,
        ]);

        $group->members()->create([
            'user_id' => $request->user()->id,
            'role_in_group' => GroupMemberRole::Enseignant,
            'last_read_at' => now(),
        ]);

        return redirect()->route('class-groups.show', $group)->with('status', 'Groupe créé.');
    }

    public function join(JoinClassGroupRequest $request): RedirectResponse
    {
        $user = $request->user();
        $group = ClassGroup::where('join_code', strtoupper($request->validated('code')))->first();

        abort_if($group === null, 404, 'Code de groupe introuvable.');
        abort_if($group->memberFor($user) !== null, 409, 'Vous êtes déjà membre de ce groupe.');

        $group->members()->create([
            'user_id' => $user->id,
            'role_in_group' => $user->hasLegacyRole(Role::Enseignant) ? GroupMemberRole::Enseignant : GroupMemberRole::Etudiant,
            'last_read_at' => now(),
        ]);

        return redirect()->route('class-groups.show', $group)->with('status', "Vous avez rejoint « {$group->name} ».");
    }

    public function show(Request $request, ClassGroup $group): Response
    {
        $user = $request->user();
        $group->load(['teacher', 'filiere', 'members.user']);
        $membership = $group->memberFor($user);

        abort_if($membership === null || $membership->is_banned, 403);

        $membership->update(['last_read_at' => now()]);

        return Inertia::render('Groupes/Show', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'type' => $group->type->value,
                'type_label' => $group->type->label(),
                'annee' => $group->annee,
                'niveau' => $group->niveau,
                'filiere' => $group->filiere?->nom_fr,
                'teacher_id' => $group->teacher_id,
                'join_code' => $membership->role_in_group === GroupMemberRole::Enseignant ? $group->join_code : null,
                'has_presence' => $group->hasPresenceFeature(),
                'is_archived' => $group->archived_at !== null,
            ],
            'membership' => [
                'role_in_group' => $membership->role_in_group->value,
                'is_delegate' => $membership->is_delegate,
                'can_moderate' => $membership->canModerate(),
                'can_download_presence' => $membership->canDownloadPresence(),
            ],
            'friendsNotInGroup' => $membership->canModerate()
                ? $user->friends()
                    ->reject(fn (User $friend) => $group->memberFor($friend) !== null)
                    ->map(fn (User $friend) => ['id' => $friend->id, 'name' => $friend->name, 'avatar_path' => $friend->avatar_path])
                    ->values()
                : [],
            'members' => $group->members->map(fn (ClassGroupMember $m) => [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'name' => $m->user->name,
                'avatar_path' => $m->user->avatar_path,
                'role_in_group' => $m->role_in_group->value,
                'is_banned' => $m->is_banned,
                'is_delegate' => $m->is_delegate,
            ]),
            'messages' => ClassGroupMessage::query()
                ->where('class_group_id', $group->id)
                ->whereDoesntHave('hiddenFor', fn ($query) => $query->where('users.id', $user->id))
                ->with(['sender', 'attachments'])
                ->orderBy('created_at')
                ->get()
                ->map(fn (ClassGroupMessage $message) => [
                    'id' => $message->id,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name,
                    'body' => $message->body,
                    'created_at' => $message->created_at,
                    'deleted_for_everyone' => $message->deleted_for_everyone_at !== null,
                    'attachments' => $message->attachments->map(fn ($a) => [
                        'id' => $a->id,
                        'path' => $a->path,
                        'original_name' => $a->original_name,
                        'file_type' => $a->file_type,
                    ]),
                ]),
            'announcements' => ClassGroupAnnouncement::query()
                ->where('class_group_id', $group->id)
                ->with('teacher')
                ->latest()
                ->get()
                ->map(fn (ClassGroupAnnouncement $a) => [
                    'id' => $a->id,
                    'type' => $a->type->value,
                    'type_label' => $a->type->label(),
                    'title' => $a->title,
                    'description' => $a->description,
                    'due_date' => $a->due_date,
                    'created_at' => $a->created_at,
                    'teacher_name' => $a->teacher->name,
                ]),
        ]);
    }

    public function addMembers(Request $request, ClassGroup $group): RedirectResponse
    {
        $user = $request->user();
        $membership = $group->memberFor($user);
        abort_if($membership === null || ! $membership->canModerate(), 403);

        $data = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer'],
        ]);

        $friendIds = $user->friends()->pluck('id');
        $toAdd = collect($data['user_ids'])
            ->intersect($friendIds)
            ->reject(fn ($id) => $group->memberFor(User::find($id)) !== null);

        foreach ($toAdd as $friendId) {
            $group->members()->create([
                'user_id' => $friendId,
                'role_in_group' => GroupMemberRole::Etudiant,
                'last_read_at' => null,
            ]);
        }

        return back()->with('status', $toAdd->count() > 1 ? "{$toAdd->count()} amis ajoutés au groupe." : 'Ami ajouté au groupe.');
    }

    public function archive(Request $request, ClassGroup $group): RedirectResponse
    {
        $membership = $group->memberFor($request->user());
        abort_if($membership === null || ! $membership->canModerate(), 403);

        $group->update(['archived_at' => $group->archived_at === null ? now() : null]);

        return back()->with('status', $group->archived_at !== null ? 'Groupe archivé.' : 'Groupe désarchivé.');
    }

    public function destroy(Request $request, ClassGroup $group): RedirectResponse
    {
        $membership = $group->memberFor($request->user());
        abort_if($membership === null || ! $membership->canModerate(), 403);

        $group->delete();

        return redirect()->route('class-groups.index')->with('status', 'Groupe supprimé.');
    }

    private function generateJoinCode(): string
    {
        $characters = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

        do {
            $code = collect(range(1, 6))->map(fn () => $characters[random_int(0, strlen($characters) - 1)])->implode('');
        } while (ClassGroup::where('join_code', $code)->exists());

        return $code;
    }
}
