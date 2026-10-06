<?php

namespace App;

/**
 * The public site's brand accent — overrides --color-isstm-gold (resources/css/app.css)
 * via an inline <style> in app.blade.php. Every entry stays light/bright enough to
 * work both as text on the (dark) primary color and as a button fill under dark text
 * (see bg-isstm-gold text-isstm-navy-dark in Hero.jsx).
 */
enum SiteAccentColor: string
{
    case Gold = 'gold';
    case Amber = 'amber';
    case Cyan = 'cyan';
    case Rose = 'rose';
    case Lime = 'lime';
    case Silver = 'silver';
    case Orange = 'orange';
    case Sky = 'sky';
    case Mint = 'mint';
    case Fuchsia = 'fuchsia';
    case Coral = 'coral';
    case Sand = 'sand';

    public function label(): string
    {
        return match ($this) {
            self::Gold => 'Or (défaut)',
            self::Amber => 'Ambre',
            self::Cyan => 'Cyan clair',
            self::Rose => 'Rose vif',
            self::Lime => 'Vert citron',
            self::Silver => 'Argenté',
            self::Orange => 'Orange',
            self::Sky => 'Bleu ciel',
            self::Mint => 'Menthe',
            self::Fuchsia => 'Fuchsia',
            self::Coral => 'Corail',
            self::Sand => 'Sable',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Gold => '#d4a017',
            self::Amber => '#f59e0b',
            self::Cyan => '#22d3ee',
            self::Rose => '#fb7185',
            self::Lime => '#a3e635',
            self::Silver => '#cbd5e1',
            self::Orange => '#fb923c',
            self::Sky => '#38bdf8',
            self::Mint => '#34d399',
            self::Fuchsia => '#e879f9',
            self::Coral => '#fb7f6b',
            self::Sand => '#e7d3a7',
        };
    }

    /**
     * @return array<int, array{value: string, label: string, swatch: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $color) => ['value' => $color->value, 'label' => $color->label(), 'swatch' => $color->color()],
            self::cases(),
        );
    }
}
