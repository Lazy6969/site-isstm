<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TouchLastActivity
{
    /**
     * Refreshes the authenticated user's `last_activity` (used by
     * User::isOnline() for the presence dot on Amis/Messages) on every
     * community request — throttled to once per 20s per user via cache so a
     * page doing several requests in a row doesn't hit the database each time.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null) {
            $cacheKey = "last-activity-touched:{$user->id}";

            if (! Cache::has($cacheKey)) {
                $user->forceFill(['last_activity' => now()])->save();
                Cache::put($cacheKey, true, now()->addSeconds(20));
            }
        }

        return $next($request);
    }
}
