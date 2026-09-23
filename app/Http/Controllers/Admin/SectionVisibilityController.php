<?php

namespace App\Http\Controllers\Admin;

use App\HomeSection;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SectionVisibilityController extends Controller
{
    private const SETTING_KEY = 'sections.hidden';

    /**
     * The homepage sections currently hidden — shared to Inertia by
     * HomeController so Home.jsx can skip rendering them for visitors (and
     * still render them, dimmed, for a super admin in quick-edit mode).
     *
     * @return array<int, string>
     */
    public static function hidden(): array
    {
        $decoded = json_decode(Setting::get(self::SETTING_KEY, '[]'), true);

        return is_array($decoded) ? $decoded : [];
    }

    public function toggle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'section' => ['required', Rule::enum(HomeSection::class)],
        ]);

        $hidden = self::hidden();
        $section = $validated['section'];

        $hidden = in_array($section, $hidden, true)
            ? array_values(array_diff($hidden, [$section]))
            : [...$hidden, $section];

        Setting::set(self::SETTING_KEY, json_encode($hidden));

        return back()->with('status', 'Visibilité de la section mise à jour.');
    }
}
