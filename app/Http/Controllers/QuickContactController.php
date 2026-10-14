<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use App\Notifications\QuickContactMessageReceived;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Throwable;

class QuickContactController extends Controller
{
    /**
     * The Contact page's "send a quick message" form — sends straight to
     * contact_formulaire_email (editable via the pencil next to the form,
     * see ExternalPencil/EditLinkDialog) rather than opening the visitor's
     * own mail client, unlike the mailto: cards above it.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'objet' => ['required', 'string', 'max:150'],
            'nom' => ['required', 'string', 'max:100'],
            'prenoms' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $recipient = SiteContent::where('content_key', 'contact_formulaire_email')->value('content_value_fr');

        if (! $recipient) {
            return back()->with('error', __('contact.formulaire_erreur'));
        }

        try {
            Notification::route('mail', $recipient)->notify(new QuickContactMessageReceived(
                $validated['objet'],
                $validated['nom'],
                $validated['prenoms'],
                $validated['email'],
                $validated['telephone'] ?? null,
                $validated['message'],
            ));
        } catch (Throwable $e) {
            report($e);

            return back()->with('error', __('contact.formulaire_erreur'));
        }

        return back()->with('status', __('contact.formulaire_succes'));
    }
}
