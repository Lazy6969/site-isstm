<?php

namespace App\Http\Requests\Auth;

use App\Models\AccessKey;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DepartmentLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'access_key' => ['required', 'string'],
        ];
    }

    /**
     * Authenticates for the given department's subdomain: normal email/password
     * (same as the main login), then the account must hold that department's
     * role, be active, and the department's shared access key must match and
     * be currently enabled.
     */
    public function authenticate(string $role): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'Ces identifiants ne correspondent à aucun compte de cet espace.',
            ]);
        }

        $user = Auth::user();

        if (! $user->is_active || ! $user->hasRole($role)) {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'Ces identifiants ne correspondent à aucun compte de cet espace.',
            ]);
        }

        $accessKey = AccessKey::where('role', $role)->first();

        if ($accessKey === null || ! $accessKey->is_active) {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => "Votre clé d'accès est actuellement désactivée. Veuillez contacter le Super Administrateur.",
            ]);
        }

        if (! $accessKey->matches($this->string('access_key'))) {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'access_key' => "Clé d'accès invalide.",
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => "Trop de tentatives. Réessayez dans {$seconds} secondes.",
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
