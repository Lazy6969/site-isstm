<?php

namespace App\Http\Middleware;

use App\EcolageStatus;
use App\Http\Controllers\Admin\ContactFieldVisibilityController;
use App\Models\EcolagePayment;
use App\Models\MaterielEmprunt;
use App\Models\MaterielIntervention;
use App\Models\Setting;
use App\Models\SiteContent;
use App\PreinscriptionStatus;
use App\SitePrimaryColor;
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
                'error' => fn () => $request->session()->get('error'),
            ],
            // Counts shown as bubbles next to admin sidebar entries — only computed
            // for staff who can open the page the bubble points to.
            'adminBadges' => fn () => [
                'ecolage' => $request->user()?->can('payments.view')
                    ? EcolagePayment::where('status', EcolageStatus::EnAttente)->count()
                    : 0,
                'materiel_retards' => $request->user()?->can('materiel.view') ? MaterielEmprunt::enRetard()->count() : 0,
                'materiel_interventions' => $request->user()?->can('materiel.view') ? MaterielIntervention::ouvertes()->count() : 0,
            ],
            'locale' => app()->getLocale(),
            'translations' => fn () => SiteContent::translationsWithOverrides(),
            'content' => fn () => SiteContent::all()->keyBy('content_key')
                ->map(fn (SiteContent $item) => $item->localizedValue()),
            // Kept separate from `content` (a plain string per key) rather than
            // nesting {value, style} there, so the ~300 existing `{content.xxx}`
            // usages across the app don't all need to change shape.
            'contentStyles' => fn () => SiteContent::all()->keyBy('content_key')
                ->map(fn (SiteContent $item) => $item->style)
                ->reject(fn (?array $style) => empty($style)),
            // Global (not per-controller) since ContactCards/ContactMaps render
            // identically from both the homepage and /contact.
            'hiddenContactFields' => fn () => ContactFieldVisibilityController::hidden(),
            // Drives the "Mon dossier" link in FloatingAccountButton — a candidate
            // account (role User) with a préinscription still awaiting a decision.
            'hasPendingPreinscription' => fn () => $request->user()
                ?->candidats()
                ->where('status', PreinscriptionStatus::Soumis)
                ->exists() ?? false,
            // Gates the Préinscription/Ancien étudiant entry points everywhere
            // they're offered (see HeroParcoursCards.jsx) — set from
            // /console/settings/inscriptions.
            // Closed either by its own dedicated toggle, or by the broader
            // "Admissions fermées" status (see AdmissionsStatus.jsx) — either
            // one alone is enough to gate préinscription/réactivation/frais.
            'inscriptionsClosed' => fn () => Setting::get('inscriptions.closed', 'false') === 'true'
                || Setting::get('admissions.open', 'true') === 'false',
            'inscriptionsClosedMessage' => fn () => Setting::get(
                'inscriptions.closed_message',
                'Les inscriptions sont actuellement fermées.',
            ) ?: 'Les inscriptions sont actuellement fermées.',
            // Drives the "Admissions ouvertes/fermées" banner (see
            // Components/Home/AdmissionsStatus.jsx) — toggled from the pencil
            // on the page itself (for whoever holds settings.manage) or from
            // /console/settings/maintenance.
            'admissionsOpen' => fn () => Setting::get('admissions.open', 'true') === 'true',
            // Feeds the quick site-color picker fixed on the public site (see
            // SitePrimaryColorPicker.jsx) — shared globally rather than only on
            // the admin settings page, since the picker itself is available
            // everywhere quick edit is on.
            'sitePrimaryColor' => fn () => [
                'current' => Setting::get('appearance.site_primary', SitePrimaryColor::Navy->value),
                // The actual "#rrggbb" this resolves to, whether `current` is a
                // preset key or already a custom hex — lets any quick-edit color
                // picker (e.g. HeroSparkleColorPicker) default to the real color
                // currently in effect, even when it's a named preset.
                'resolvedHex' => SitePrimaryColor::resolve(Setting::get('appearance.site_primary'))[0],
                'options' => SitePrimaryColor::options(),
            ],
            // Which decorative wave background (see AbstractWaves.jsx) to
            // show behind every public page's light sections, or 'none' —
            // shared globally since the component renders on many pages, not
            // just the admin settings page. AbstractWaves itself skips
            // /communaute regardless of this setting.
            'abstractWavesDesign' => fn () => Setting::get('appearance.abstract_waves', 'none'),
            // The section-title underline's color (see TitleUnderline.jsx) —
            // empty means "use the component's own gold default".
            'titleUnderlineColor' => fn () => Setting::get('appearance.title_underline', ''),
            // 'dash' (original short rule) or 'bar' (wider highlight stroke).
            'titleUnderlineStyle' => fn () => Setting::get('appearance.title_underline_style', 'dash'),
        ];
    }
}
