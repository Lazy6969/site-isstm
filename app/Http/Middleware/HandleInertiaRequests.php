<?php

namespace App\Http\Middleware;

use App\Models\SiteContent;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'unreadNotificationsCount' => fn () => $request->user()?->unreadNotifications()->count(),
                'permissions' => fn () => $request->user()?->getAllPermissions()->pluck('name') ?? [],
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            'locale' => app()->getLocale(),
            'translations' => fn () => app('translator')->getLoader()->load(app()->getLocale(), '*', '*'),
            'content' => fn () => SiteContent::all()->keyBy('content_key')
                ->map(fn (SiteContent $item) => $item->localizedValue()),
        ];
    }
}
