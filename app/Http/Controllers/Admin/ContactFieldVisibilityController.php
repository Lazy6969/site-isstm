<?php

namespace App\Http\Controllers\Admin;

use App\ContactField;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactFieldVisibilityController extends Controller
{
    private const SETTING_KEY = 'contact.hidden_fields';

    /**
     * Hidden contact fields — shared globally to every page (see
     * HandleInertiaRequests) since ContactCards/ContactMaps render on both
     * the homepage and /contact from the same `content` shared prop.
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
            'field' => ['required', Rule::enum(ContactField::class)],
        ]);

        $hidden = self::hidden();
        $field = $validated['field'];

        $hidden = in_array($field, $hidden, true)
            ? array_values(array_diff($hidden, [$field]))
            : [...$hidden, $field];

        Setting::set(self::SETTING_KEY, json_encode($hidden));

        return back()->with('status', 'Visibilité mise à jour.');
    }
}
