<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsletterSubscriberRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;

class NewsletterController extends Controller
{
    public function store(StoreNewsletterSubscriberRequest $request): RedirectResponse
    {
        NewsletterSubscriber::firstOrCreate(['email' => $request->validated('email')]);

        return back()->with('status', 'Merci ! Votre inscription à la newsletter est confirmée.');
    }
}
