<?php

namespace App\Http\Controllers\Admin;

use App\AppearanceChromeColor;
use App\AppearanceFont;
use App\AppearancePalette;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\SiteAccentColor;
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
            ],
            'palettes' => AppearancePalette::options(),
            'chromes' => AppearanceChromeColor::options(),
            'fonts' => AppearanceFont::options(),
            'sitePrimaries' => SitePrimaryColor::options(),
            'siteAccents' => SiteAccentColor::options(),
            'siteMenus' => SiteMenuColor::options(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'palette' => ['required', Rule::enum(AppearancePalette::class)],
            'chrome' => ['required', Rule::enum(AppearanceChromeColor::class)],
            'font' => ['required', Rule::enum(AppearanceFont::class)],
            'density' => ['required', Rule::in(['compact', 'normal', 'comfortable'])],
            'sitePrimary' => ['required', Rule::enum(SitePrimaryColor::class)],
            'siteAccent' => ['required', Rule::enum(SiteAccentColor::class)],
            'siteMenu' => ['required', Rule::enum(SiteMenuColor::class)],
        ]);

        Setting::set('appearance.palette', $validated['palette']);
        Setting::set('appearance.chrome', $validated['chrome']);
        Setting::set('appearance.font', $validated['font']);
        Setting::set('appearance.density', $validated['density']);
        Setting::set('appearance.site_primary', $validated['sitePrimary']);
        Setting::set('appearance.site_accent', $validated['siteAccent']);
        Setting::set('appearance.site_menu', $validated['siteMenu']);

        ActivityLog::record('appearance_updated', "Apparence de l'administration modifiée", null, $validated);

        return back()->with('status', 'Apparence mise à jour.');
    }
}
