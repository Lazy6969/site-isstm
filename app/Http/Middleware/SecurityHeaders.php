<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A handful of response headers an OWASP ZAP scan flags as missing by
 * default on a fresh Laravel app — none of them need per-route tuning, so
 * applying them globally here is simpler than repeating config in each
 * controller. A Content-Security-Policy is deliberately NOT set here: this
 * app loads Google Fonts, an embedded Google Maps iframe, and Vite's dev
 * client, so a CSP tight enough to be worth having needs auditing every one
 * of those sources first rather than guessing one into this middleware.
 *
 * @param  Closure(Request): (Response)  $next
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // PHP's own SAPI sends this header directly (not through Symfony's
        // response), so $response->headers->remove() alone wouldn't drop it —
        // header_remove() reaches the header PHP itself queued.
        $response->headers->remove('X-Powered-By');
        header_remove('X-Powered-By');

        return $response;
    }
}
