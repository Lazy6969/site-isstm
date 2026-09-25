<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\ReactionType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MessageReactionController extends Controller
{
    public function store(Request $request, Message $message): RedirectResponse
    {
        abort_unless($message->conversation->involves($request->user()), 403);

        $validated = $request->validate([
            'type' => ['required', Rule::enum(ReactionType::class)],
        ]);

        $user = $request->user();
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
