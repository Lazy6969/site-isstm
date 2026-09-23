<?php

namespace App;

/**
 * The public footer's own background — independent of the site's primary
 * brand color, same separation as SiteMenuColor for the header. Overrides
 * --color-isstm-footer / --color-isstm-footer-text (resources/css/app.css)
 * via app.blade.php. Default means "no override" — the footer keeps
 * following --color-isstm-navy-dark, today's behavior.
 */
enum SiteFooterColor: string
{
    case Default = 'default';
    case White = 'white';
    case Black = 'black';
    case Slate = 'slate';
    case Blue = 'blue';
    case Emerald = 'emerald';
    case Violet = 'violet';
    case Amber = 'amber';
    case Rose = 'rose';

    public function label(): string
    {
        return match ($this) {
            self::Default => 'Défaut (couleur principale)',
            self::White => 'Blanc',
            self::Black => 'Noir',
            self::Slate => 'Ardoise',
            self::Blue => 'Bleu',
            self::Emerald => 'Émeraude',
            self::Violet => 'Violet',
            self::Amber => 'Ambre',
            self::Rose => 'Rose',
        };
    }

    /**
     * [background, text]. Default is never rendered (app.blade.php skips the
     * override for it), so its pair here is only a harmless placeholder.
     *
     * @return array{0: string, 1: string}
     */
    public function colors(): array
    {
        return match ($this) {
            self::Default => ['', ''],
            self::White => ['#ffffff', '#0f172a'],
            self::Black => ['#000000', '#ffffff'],
            self::Slate => ['#0f172a', '#ffffff'],
            self::Blue => ['#172554', '#ffffff'],
            self::Emerald => ['#022c22', '#ffffff'],
            self::Violet => ['#2e1065', '#ffffff'],
            self::Amber => ['#451a03', '#ffffff'],
            self::Rose => ['#4c0519', '#ffffff'],
        };
    }

    /**
     * @return array<int, array{value: string, label: string, swatch: ?string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $color) => ['value' => $color->value, 'label' => $color->label(), 'swatch' => $color === self::Default ? null : $color->colors()[0]],
            self::cases(),
        );
    }
}
