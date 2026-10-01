<?php

namespace App\Http\Controllers\Admin;

use App\AppearanceChromeColor;
use App\AppearanceFont;
use App\AppearancePalette;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\SiteAccentColor;
use App\SiteFooterColor;
use App\SiteMenuColor;
use App\SitePrimaryColor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Appearance', [
            'settings' => [
                'palette' => Setting::get('appearance.palette', AppearancePalette::Default->value),
                'chrome' => Setting::get('appearance.chrome', AppearanceChromeColor::Default->value),
                'font' => Setting::get('appearance.font', AppearanceFont::InstrumentSans->value),
                'density' => Setting::get('appearance.density', 'normal'),
                'sitePrimary' => Setting::get('appearance.site_primary', SitePrimaryColor::Navy->value),
                'siteAccent' => Setting::get('appearance.site_accent', SiteAccentColor::Gold->value),
                'siteMenu' => Setting::get('appearance.site_menu', SiteMenuColor::Default->value),
                'siteFooter' => Setting::get('appearance.site_footer', SiteFooterColor::Default->value),
            ],
            'palettes' => AppearancePalette::options(),
            'chromes' => AppearanceChromeColor::options(),
            'fonts' => AppearanceFont::options(),
            'sitePrimaries' => SitePrimaryColor::options(),
            'siteAccents' => SiteAccentColor::options(),
            'siteMenus' => SiteMenuColor::options(),
            'siteFooters' => SiteFooterColor::options(),
        ]);
    }

    /**
     * Every field is optional here (not just on the full settings form): the
     * quick site-color picker fixed on the public site (see
     * SitePrimaryColorPicker.jsx) submits only `sitePrimary` and must never
     * reset the other appearance settings to their enum defaults by doing so.
     * Only fields actually present in the request are persisted.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'palette' => ['sometimes', Rule::enum(AppearancePalette::class)],
            'chrome' => ['sometimes', Rule::enum(AppearanceChromeColor::class)],
            'font' => ['sometimes', Rule::enum(AppearanceFont::class)],
            'density' => ['sometimes', Rule::in(['compact', 'normal', 'comfortable'])],
            // A preset key (Rule::enum) OR a custom "#rrggbb" picked via the
            // native color-wheel input (see SitePrimaryColor::resolve()).
            'sitePrimary' => ['sometimes', function ($attribute, $value, $fail) {
                if (SitePrimaryColor::tryFrom($value) === null && preg_match('/^#[0-9a-f]{6}$/i', $value) !== 1) {
                    $fail('La couleur principale est invalide.');
                }
            }],
            'siteAccent' => ['sometimes', Rule::enum(SiteAccentColor::class)],
            'siteMenu' => ['sometimes', Rule::enum(SiteMenuColor::class)],
            'siteFooter' => ['sometimes', Rule::enum(SiteFooterColor::class)],
            // Overrides the homepage hero's sparkle color (see Hero.jsx); null
            // resets it to automatically follow sitePrimary.
            'heroSparkleColor' => ['sometimes', 'nullable', 'regex:/^#[0-9a-f]{6}$/i'],
        ]);

        $map = [
            'palette' => 'appearance.palette',
            'chrome' => 'appearance.chrome',
            'font' => 'appearance.font',
            'density' => 'appearance.density',
            'sitePrimary' => 'appearance.site_primary',
            'siteAccent' => 'appearance.site_accent',
            'siteMenu' => 'appearance.site_menu',
            'siteFooter' => 'appearance.site_footer',
            'heroSparkleColor' => 'appearance.hero_sparkle_color',
        ];

        foreach ($map as $field => $settingKey) {
            if (array_key_exists($field, $validated)) {
                Setting::set($settingKey, $validated[$field] ?? '');
            }
        }

        ActivityLog::record('appearance_updated', "Apparence de l'administration modifiée", null, $validated);

        return back()->with('status', 'Apparence mise à jour.');
    }
}
