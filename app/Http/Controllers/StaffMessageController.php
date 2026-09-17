<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStaffMessageRequest;
use App\Models\StaffMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class StaffMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $this->markIncomingAsRead($user);

        return Inertia::render('Messagerie/Index', [
            'others' => $this->presentOthers($user),
            'messages' => $this->visibleMessagesQuery($user)->get()->map(fn (StaffMessage $message) => $this->presentMessage($message)),
        ]);
    }

    public function poll(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->markIncomingAsRead($user);

        $sinceId = (int) $request->integer('since_id');

        $messages = $this->visibleMessagesQuery($user)
            ->where('id', '>', $sinceId)
            ->get()
            ->map(fn (StaffMessage $message) => $this->presentMessage($message));

        $deletedIds = StaffMessage::query()
            ->whereNotNull('deleted_for_everyone_at')
            ->where('deleted_for_everyone_at', '>', now()->subSeconds(20))
            ->pluck('id');

        $ownRecentlyRead = StaffMessage::query()
            ->where('sender_id', $user->id)
            ->where('id', '<=', $sinceId)
            ->whereNotNull('read_at')
            ->pluck('read_at', 'id');

        return response()->json([
            'messages' => $messages,
            'deleted_ids' => $deletedIds,
            'own_read' => $ownRecentlyRead,
            'others' => $this->presentOthers($user),
        ]);
    }

    public function store(StoreStaffMessageRequest $request): RedirectResponse
    {
        $message = StaffMessage::create([
            'sender_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        foreach ($request->file('attachments', []) as $file) {
            $message->attachments()->create([
                'path' => $file->store('messagerie', 'public'),
                'original_name' => $file->getClientOriginalName(),
                'file_type' => $this->classifyFile($file),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        return back();
    }

    public function destroy(Request $request, StaffMessage $message): RedirectResponse
    {
        $user = $request->user();
        $scope = $request->string('scope', 'me')->value();

        if ($scope === 'everyone') {
            abort_unless($message->sender_id === $user->id, 403);

            $message->attachments->each->delete();
            $message->body = null;
            $message->deleted_for_everyone_at = now();
            $message->save();
        } else {
            $message->hiddenFor()->syncWithoutDetaching([$user->id]);
        }

        return back();
    }

    public function destroyConversation(Request $request): RedirectResponse
    {
        $user = $request->user();
        $scope = $request->string('scope', 'me')->value();

        if ($scope === 'everyone') {
            StaffMessage::query()->with('attachments')->get()->each(function (StaffMessage $message) {
                $message->attachments->each->delete();
            });

            StaffMessage::query()->whereNull('deleted_for_everyone_at')->update([
                'body' => null,
                'deleted_for_everyone_at' => now(),
            ]);
        } else {
            $ids = StaffMessage::query()->pluck('id');
            $user->hiddenStaffMessages()->syncWithoutDetaching($ids);
        }

        return back()->with('status', 'Conversation supprimée.');
    }

    public function search(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = trim((string) $request->string('q'));

        if ($query === '') {
            return response()->json(['results' => []]);
        }

        $results = $this->visibleMessagesQuery($user)
            ->where('body', 'like', "%{$query}%")
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (StaffMessage $message) => $this->presentMessage($message));

        return response()->json(['results' => $results]);
    }

    private function markIncomingAsRead(User $user): void
    {
        StaffMessage::query()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    private function visibleMessagesQuery(User $user): Builder
    {
        return StaffMessage::query()
            ->whereDoesntHave('hiddenFor', fn ($query) => $query->where('users.id', $user->id))
            ->whereNull('deleted_for_everyone_at')
            ->with(['sender', 'attachments'])
            ->orderBy('id');
    }

    /**
     * @return array<string, mixed>
     */
    private function presentMessage(StaffMessage $message): array
    {
        return [
            'id' => $message->id,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->name,
            'sender_avatar' => $message->sender->avatar_path,
            'body' => $message->body,
            'created_at' => $message->created_at,
            'read_at' => $message->read_at,
            'attachments' => $message->attachments->map(fn ($a) => [
                'id' => $a->id,
                'path' => $a->path,
                'original_name' => $a->original_name,
                'file_type' => $a->file_type,
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function presentOthers(User $user): array
    {
        return User::query()
            ->where('is_messagerie', true)
            ->where('id', '!=', $user->id)
            ->orderBy('name')
            ->get()
            ->map(fn (User $other) => [
                'id' => $other->id,
                'name' => $other->name,
                'avatar_path' => $other->avatar_path,
                'online' => $other->isOnline(),
            ])
            ->all();
    }

    private function classifyFile(UploadedFile $file): string
    {
        $mime = (string) $file->getMimeType();
        $extension = strtolower((string) $file->getClientOriginalExtension());

        if (str_starts_with($mime, 'image/') || in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'avif', 'svg'], true)) {
            return 'image';
        }

        if (str_starts_with($mime, 'video/') || in_array($extension, ['mp4', 'webm', 'mov', 'ogg', 'avi', 'mkv', 'm4v'], true)) {
            return 'video';
        }

        return 'file';
    }
}
