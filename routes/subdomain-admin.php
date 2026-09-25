<?php

use App\Http\Controllers\Admin\DepartmentDashboardController;
use App\Http\Controllers\Auth\DepartmentAuthenticatedSessionController;
use App\Models\AccessKey;
use Illuminate\Support\Facades\Route;

/**
 * Separate admin space per department, reachable only on its own subdomain
 * (e.g. scolarite.site-isstm.test) and gated by role + a shared department
 * access key managed by the Super Admin — see routes/access-keys.php and
 * App\Http\Middleware\EnsureAccessKeyActive. This is additive: the existing
 * /console/scolarite/* routes on the main domain are untouched.
 */
$rootDomain = parse_url(config('app.url'), PHP_URL_HOST);

foreach (AccessKey::DEPARTMENTS as $subdomain => $role) {
    Route::domain("{$subdomain}.{$rootDomain}")->group(function () use ($subdomain, $role) {
        Route::middleware('guest')->group(function () use ($subdomain) {
            Route::get('login', [DepartmentAuthenticatedSessionController::class, 'create'])
                ->defaults('department', $subdomain)
                ->name("{$subdomain}.login");
            Route::post('login', [DepartmentAuthenticatedSessionController::class, 'store'])
                ->defaults('department', $subdomain)
                ->middleware('throttle:login')
                ->name("{$subdomain}.login.attempt");
        });

        Route::middleware(['auth', "department.access:{$role}"])->group(function () use ($subdomain) {
            Route::get('dashboard', [DepartmentDashboardController::class, 'index'])
                ->defaults('department', $subdomain)
                ->name("{$subdomain}.dashboard");
            Route::post('logout', [DepartmentAuthenticatedSessionController::class, 'destroy'])
                ->defaults('department', $subdomain)
                ->name("{$subdomain}.logout");
        });

        Route::redirect('/', '/dashboard');
    });
}
