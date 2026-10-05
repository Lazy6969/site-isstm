<?php

namespace App\Http\Middleware;

use App\ArchiveVault;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps every archive endpoint behind the archive key (see ArchiveVault).
 */
class EnsureArchiveUnlocked
{
    public function __construct(private ArchiveVault $vault) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->vault->isUnlocked($request)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Archive verrouillée.'], 423);
        }

        return redirect()->route('admin.archives.index');
    }
}
