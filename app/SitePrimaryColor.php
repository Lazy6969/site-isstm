<?php

namespace App;

/**
 * The public site's brand primary/primary-dark pair — overrides
 * --color-isstm-navy / --color-isstm-navy-dark (resources/css/app.css) via an
 * inline <style> in app.blade.php, the same technique already used for the
 * admin panel's --color-admin-accent. Every entry stays dark enough for white
 * text on top of it (the site uses text-white on bg-isstm-navy throughout).
 */
enum SitePrimaryColor: string
{
    case Navy = 'navy';
    case Blue = 'blue';
    case Emerald = 'emerald';
    case Burgundy = 'burgundy';
    case Charcoal = 'charcoal';
    case Violet = 'violet';
    case Teal = 'teal';
    case Crimson = 'crimson';
    case Indigo = 'indigo';
    case Forest = 'forest';
    case Brown = 'brown';
    case Steel = 'steel';

    public function label(): string
    {
        return match ($this) {
            self::Navy => 'Bleu marine (défaut)',
            self::Blue => 'Bleu roi',
            self::Emerald => 'Émeraude',
            self::Burgundy => 'Bordeaux',
            self::Charcoal => 'Anthracite',
            self::Violet => 'Violet profond',
            self::Teal => 'Sarcelle profonde',
            self::Crimson => 'Cramoisi',
            self::Indigo => 'Indigo',
            self::Forest => 'Vert forêt',
            self::Brown => 'Brun',
            self::Steel => 'Bleu acier',
        };
    }

    /**
     * [primary, primary-dark].
     *
     * @return array{0: string, 1: string}
     */
    public function colors(): array
    {
        return match ($this) {
            self::Navy => ['#003366', '#001f3f'],
            self::Blue => ['#1e3a8a', '#172554'],
            self::Emerald => ['#065f46', '#033024'],
            self::Burgundy => ['#7f1d1d', '#450a0a'],
            self::Charcoal => ['#1f2937', '#0f172a'],
            self::Violet => ['#4c1d95', '#2e1065'],
            self::Teal => ['#115e59', '#042f2e'],
            self::Crimson => ['#9f1239', '#500724'],
            self::Indigo => ['#312e81', '#1e1b4b'],
            self::Forest => ['#14532d', '#052e16'],
            self::Brown => ['#78350f', '#451a03'],
            self::Steel => ['#334155', '#1e293b'],
        };
    }

    /**
     * @return array<int, array{value: string, label: string, swatch: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $color) => ['value' => $color->value, 'label' => $color->label(), 'swatch' => $color->colors()[0]],
            self::cases(),
        );
    }

    /**
     * Resolves a stored `appearance.site_primary` value into [primary, dark] —
     * either one of this enum's fixed pairs, or, when the admin picked a
     * custom color via the native color-wheel picker (stored as a raw
     * "#rrggbb" string instead of an enum key), that hex plus a programmatically
     * darkened variant for --color-isstm-navy-dark.
     *
     * @return array{0: string, 1: string}
     */
    public static function resolve(?string $value): array
    {
        if ($value !== null && preg_match('/^#[0-9a-f]{6}$/i', $value) === 1) {
            return [$value, self::darken($value, 0.4)];
        }

        return (self::tryFrom($value ?? '') ?? self::Navy)->colors();
    }

    private static function darken(string $hex, float $amount): string
    {
        [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');

        return sprintf(
            '#%02x%02x%02x',
            (int) round($r * (1 - $amount)),
            (int) round($g * (1 - $amount)),
            (int) round($b * (1 - $amount)),
        );
    }
}
