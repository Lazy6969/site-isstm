<?php

namespace App\Http\Controllers;

use App\Models\ClassGroupMessage;
use App\ReactionType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClassGroupMessageReactionController extends Controller
{
    public function store(Request $request, ClassGroupMessage $message): RedirectResponse
    {
        $user = $request->user();
        $membership = $message->classGroup->memberFor($user);
        abort_if($membership === null || $membership->is_banned, 403);

        $validated = $request->validate([
            'type' => ['required', Rule::enum(ReactionType::class)],
        ]);

        $existing = $message->reactions()->where('user_id', $user->id)->first();

        if ($existing && $existing->type->value === $validated['type']) {
            $existing->delete();

            return back();
        }

        $message->reactions()->updateOrCreate(
            ['user_id' => $user->id],
            ['type' => $validated['type']],
        );

        return back();
    }
}
