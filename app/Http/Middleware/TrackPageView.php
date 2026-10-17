<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Counts one "site view" per full page render on the public-facing side of
 * the site — never the admin console, and never a partial Inertia reload
 * (pagination, polling, a background refresh) or a plain JSON fetch
 * endpoint (e.g. /stories, the messages status poll), which aren't a new
 * visit. Feeds the admin dashboard's view counter.
 *
 * By the time middleware sees the response, Laravel has already converted
 * Inertia::render()'s Responsable into a plain HTTP response, so this can't
 * check for an Inertia\Response instance — it reads the same headers the
 * browser/Inertia client itself relies on instead: a genuine first load
 * renders text/html, and a client-side Inertia navigation carries the
 * X-Inertia response header; neither is present on an unrelated JSON
 * endpoint, and a partial reload is excluded via its own request header.
 */
class TrackPageView
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->isSiteVisit($request, $response)) {
            try {
                PageView::create(['path' => '/'.ltrim($request->path(), '/')]);
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $response;
    }

    private function isSiteVisit(Request $request, Response $response): bool
    {
        if (! $request->isMethod('get') || $request->is('console/*') || $response->getStatusCode() !== 200) {
            return false;
        }

        if ($request->headers->has('X-Inertia-Partial-Data')) {
            return false;
        }

        $isInertiaNavigation = $response->headers->get('X-Inertia') === 'true';
        $isHtmlDocument = str_contains((string) $response->headers->get('Content-Type'), 'text/html');

        return $isInertiaNavigation || $isHtmlDocument;
    }
}
