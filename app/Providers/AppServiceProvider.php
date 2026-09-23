<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
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

        // The only account created without going through /console is a candidate's
        // préinscription — so this e-mail always confirms their dossier was received,
        // rather than the framework's generic "please verify your e-mail" wording.
        VerifyEmail::toMailUsing(function (User $user, string $url) {
            return (new MailMessage)
                ->subject('Votre dossier de préinscription a bien été reçu — ISSTM Mahajanga')
                ->greeting("Bonjour {$user->name},")
                ->line("Nous avons bien reçu votre dossier de préinscription à l'ISSTM Mahajanga.")
                ->line('Cliquez sur le bouton ci-dessous pour activer votre compte et suivre votre dossier en ligne (statut, décision de la scolarité, matricule une fois accepté).')
                ->action('Activer mon compte', $url)
                ->line("Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.");
        });
    }
}
