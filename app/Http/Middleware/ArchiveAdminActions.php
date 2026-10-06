<?php

namespace App\Http\Middleware;

use App\ActionArchiveRecorder;
use App\Models\ActionArchive;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Writes every state-changing console request (POST / PUT / PATCH / DELETE
 * under /console) into the locked action archive: who, when, from where,
 * what was submitted and which records changed (old → new).
 */
class ArchiveAdminActions
{
    private const SKIPPED_INPUT = ['password', 'password_confirmation', 'current_password', '_token', '_method', 'token'];

    public function __construct(private ActionArchiveRecorder $recorder) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldArchive($request)) {
            return $next($request);
        }

        $this->recorder->start();

        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            $this->store($request, null, $this->recorder->stop(), 500);

            throw $exception;
        }

        $this->store($request, $response, $this->recorder->stop(), $response->getStatusCode());

        return $response;
    }

    private function shouldArchive(Request $request): bool
    {
        return $request->user() !== null
            && ! $request->isMethodSafe()
            && $request->is('console/*');
    }

    /**
     * @param  array<int, array<string, mixed>>  $changes
     */
    private function store(Request $request, ?Response $response, array $changes, int $status): void
    {
        try {
            [$module, $action] = $this->moduleAndAction($request);
            $user = $request->user();

            ActionArchive::record([
                'user_id' => $user->getKey(),
                'user_name' => $user->name,
                'user_role' => $user->roles->first()?->name,
                'method' => $request->method(),
                'route_name' => $request->route()?->getName(),
                'path' => '/'.ltrim($request->path(), '/'),
                'module' => $module,
                'action' => $action,
                'subject_label' => $changes[0]['label'] ?? null,
                'target_id' => $request->attributes->get('archive_target_id'),
                'outcome' => $this->failed($request, $status) ? 'failed' : 'success',
                'status_code' => $status,
                'changes' => $changes === [] ? null : json_encode($changes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'input' => json_encode($this->input($request), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'ip_address' => $request->ip(),
            ]);
        } catch (Throwable $exception) {
            // The archive must never break the action being archived.
            report($exception);
        }
    }

    private function failed(Request $request, int $status): bool
    {
        if ($status >= 400) {
            return true;
        }

        if (! $request->hasSession()) {
            return false;
        }

        $errors = $request->session()->get('errors');

        return $errors !== null && $errors->any();
    }

    /**
     * "admin.news.store" → ["news", "store"]; other routes fall back to the URL.
     *
     * @return array{0: string|null, 1: string|null}
     */
    private function moduleAndAction(Request $request): array
    {
        $name = $request->route()?->getName();

        if ($name !== null && str_starts_with($name, 'admin.')) {
            $parts = explode('.', $name);

            return [$parts[1] ?? null, implode('.', array_slice($parts, 2)) ?: null];
        }

        $segments = array_values(array_filter(explode('/', $request->path())));

        return [$segments[1] ?? null, count($segments) > 2 ? end($segments) : strtolower($request->method())];
    }

    /**
     * What was submitted, without secrets; files are reduced to name and size.
     *
     * @return array<string, mixed>
     */
    private function input(Request $request): array
    {
        $data = Arr::except($request->except(array_keys($request->allFiles())), self::SKIPPED_INPUT);

        array_walk_recursive($data, function (&$value): void {
            if (is_string($value) && mb_strlen($value) > 500) {
                $value = mb_substr($value, 0, 500).'…';
            }
        });

        $files = [];
        foreach (Arr::dot($request->allFiles()) as $key => $file) {
            if ($file instanceof UploadedFile) {
                $files[$key] = $file->getClientOriginalName();
            }
        }

        return $files === [] ? $data : $data + ['_fichiers' => $files];
    }
}
