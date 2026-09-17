<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassGroupMessageRequest;
use App\MediaType;
use App\Models\ClassGroup;
use App\Models\ClassGroupMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ClassGroupMessageController extends Controller
{
    public function store(StoreClassGroupMessageRequest $request, ClassGroup $group): RedirectResponse
    {
        $user = $request->user();
        $membership = $group->memberFor($user);
        abort_if($membership === null || $membership->is_banned, 403);

        $message = ClassGroupMessage::create([
            'class_group_id' => $group->id,
            'sender_id' => $user->id,
            'body' => $request->validated('body'),
        ]);

        foreach ($request->file('attachments', []) as $file) {
            $mediaType = MediaType::fromMimeType($file->getMimeType());

            $message->attachments()->create([
                'path' => $file->store('groupes', 'public'),
                'original_name' => $file->getClientOriginalName(),
                'file_type' => $mediaType?->value ?? 'file',
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        return back();
    }

    public function destroy(Request $request, ClassGroupMessage $message): RedirectResponse
    {
        $user = $request->user();
        $membership = $message->classGroup->memberFor($user);
        abort_if($membership === null, 403);

        $scope = $request->string('scope', 'me')->value();

        if ($scope === 'everyone') {
            $isAuthor = $message->sender_id === $user->id;
            abort_unless($isAuthor || $membership->canModerate(), 403);

            $message->attachments->each->delete();
            $message->body = null;
            $message->deleted_for_everyone_at = now();
            $message->save();
        } else {
            $message->hiddenFor()->syncWithoutDetaching([$user->id]);
        }

        return back();
    }
}
