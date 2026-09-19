<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(Str::transliterate(
                Str::lower((string) $request->string('email')).'|'.$request->ip()
            ));
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(3)->by(Str::transliterate(
                Str::lower((string) $request->string('email')).'|'.$request->ip()
            ));
        });

        Gate::before(fn (User $user, string $ability) => $user->hasAnyRole('super-admin') ? true : null);
    }
}
