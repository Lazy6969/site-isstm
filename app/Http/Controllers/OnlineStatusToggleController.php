<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OnlineStatusToggleController extends Controller
{
    public function toggle(Request $request): RedirectResponse
    {
        $user = $request->user();
        $user->update(['show_online_status' => ! $user->show_online_status]);

        return back()->with('status', $user->show_online_status ? 'Statut en ligne activé.' : 'Statut en ligne désactivé.');
    }
}
