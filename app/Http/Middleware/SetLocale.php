<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /** @var array<int, string> */
    public const SUPPORTED_LOCALES = ['fr', 'en', 'mg'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('locale', 'fr');

        if (! in_array($locale, self::SUPPORTED_LOCALES, true)) {
            $locale = 'fr';
        }

        App::setLocale($locale);

        return $next($request);
    }
}
