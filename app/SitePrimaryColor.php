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

    public function label(): string
    {
        return match ($this) {
            self::Navy => 'Bleu marine (défaut)',
            self::Blue => 'Bleu roi',
            self::Emerald => 'Émeraude',
            self::Burgundy => 'Bordeaux',
            self::Charcoal => 'Anthracite',
            self::Violet => 'Violet profond',
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
}
