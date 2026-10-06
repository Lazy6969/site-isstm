<?php

namespace App;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

/**
 * The key (password) that protects the action archive. Only a bcrypt hash is
 * stored (in `settings`); unlocking is remembered in the session for a limited,
 * sliding time, and wrong attempts are rate limited per user and IP.
 */
class ArchiveVault
{
    public const SESSION_KEY = 'archive_unlocked_at';

    public const UNLOCK_MINUTES = 30;

    private const MAX_ATTEMPTS = 5;

    private const DECAY_SECONDS = 300;

    public function hasKey(): bool
    {
        return Setting::get('archives.password_hash') !== null;
    }

    /**
     * Whether viewing the archive requires the key. Off ("public") until a
     * key exists and protection has been turned on.
     */
    public function isProtected(): bool
    {
        return $this->hasKey() && Setting::get('archives.protected', '1') === '1';
    }

    public function isUnlocked(Request $request): bool
    {
        if (! $this->isProtected()) {
            return true;
        }

        $unlockedAt = $request->session()->get(self::SESSION_KEY);

        if ($unlockedAt === null || now()->timestamp - $unlockedAt > self::UNLOCK_MINUTES * 60) {
            $request->session()->forget(self::SESSION_KEY);

            return false;
        }

        $request->session()->put(self::SESSION_KEY, now()->timestamp);

        return true;
    }

    public function unlock(Request $request): void
    {
        $request->session()->put(self::SESSION_KEY, now()->timestamp);
    }

    public function lock(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
    }

    public function checkKey(string $key): bool
    {
        $hash = Setting::get('archives.password_hash');

        return $hash !== null && Hash::check($key, $hash);
    }

    public function setKey(string $key): void
    {
        Setting::set('archives.password_hash', Hash::make($key));
    }

    public function setProtected(bool $protected): void
    {
        Setting::set('archives.protected', $protected ? '1' : '0');
    }

    /**
     * Seconds to wait before another attempt, or null when attempts remain.
     */
    public function lockedOutFor(Request $request): ?int
    {
        $bucket = $this->bucket($request);

        return RateLimiter::tooManyAttempts($bucket, self::MAX_ATTEMPTS) ? RateLimiter::availableIn($bucket) : null;
    }

    public function recordFailure(Request $request): void
    {
        RateLimiter::hit($this->bucket($request), self::DECAY_SECONDS);
    }

    public function clearFailures(Request $request): void
    {
        RateLimiter::clear($this->bucket($request));
    }

    private function bucket(Request $request): string
    {
        return 'archive-key:'.($request->user()?->getKey() ?? 'guest').'|'.$request->ip();
    }
}
