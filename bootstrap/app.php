<?php

use App\Http\Middleware\EnsureAccessKeyActive;
use App\Http\Middleware\EnsureIsMessagerieUser;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\TouchLastActivity;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            SetLocale::class,
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'messagerie' => EnsureIsMessagerieUser::class,
            'department.access' => EnsureAccessKeyActive::class,
            'activity' => TouchLastActivity::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // A CSRF token mismatch (expired tab, session timeout) isn't a valid
        // Inertia response, so without this Inertia falls back to its raw
        // error-page modal — confusing mid-wizard. Redirecting back with the
        // app's own `error` flash instead surfaces it through the normal,
        // already-handled flash-message path on every page.
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if ($response->getStatusCode() === 419 && ! $request->expectsJson()) {
                return back()->with('error', 'Votre session a expiré. Merci de réessayer.');
            }

            return $response;
        });
    })->create();
