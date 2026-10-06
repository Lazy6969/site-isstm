<?php

namespace App;

enum AppearanceChromeColor: string
{
    case Default = 'default';
    case White = 'white';
    case Black = 'black';
    case Slate = 'slate';
    case Blue = 'blue';
    case Indigo = 'indigo';
    case Emerald = 'emerald';
    case Teal = 'teal';
    case Violet = 'violet';
    case Amber = 'amber';
    case Rose = 'rose';
    case Cyan = 'cyan';
    case Navy = 'navy';
    case Wine = 'wine';
    case Forest = 'forest';
    case Plum = 'plum';
    case Graphite = 'graphite';
    case Ocean = 'ocean';

    public function label(): string
    {
        return match ($this) {
            self::Default => 'Défaut (noir ISSTM)',
            self::White => 'Blanc neutre',
            self::Black => 'Noir',
            self::Slate => 'Ardoise',
            self::Blue => 'Bleu',
            self::Indigo => 'Indigo profond',
            self::Emerald => 'Émeraude',
            self::Teal => 'Sarcelle',
            self::Violet => 'Violet',
            self::Amber => 'Ambre',
            self::Rose => 'Rose',
            self::Cyan => 'Cyan',
            self::Navy => 'Bleu nuit',
            self::Wine => 'Vin',
            self::Forest => 'Forêt',
            self::Plum => 'Prune',
            self::Graphite => 'Graphite',
            self::Ocean => 'Océan',
        };
    }

    /**
     * [light background, dark background] for the sidebar + header only
     * (--color-admin-chrome) — the pastel entries are deliberately soft/
     * desaturated so the nav stays readable and non-fatiguing; Black/Slate are
     * the exception (see isDarkInLightMode()) and get light text instead.
     *
     * @return array{0: string, 1: string}
     */
    public function colors(): array
    {
        return match ($this) {
            self::Default => ['#0b0d12', '#090b0f'],
            self::White => ['#ffffff', '#10141d'],
            self::Black => ['#0b0e14', '#000000'],
            self::Slate => ['#1e293b', '#0b1220'],
            self::Blue => ['#e0edff', '#101b30'],
            self::Indigo => ['#e5e3ff', '#161233'],
            self::Emerald => ['#e3f8ef', '#0f2019'],
            self::Teal => ['#dcf7f2', '#0d211f'],
            self::Violet => ['#f1eaff', '#1c1730'],
            self::Amber => ['#fdf2e2', '#2a2013'],
            self::Rose => ['#fde8ef', '#2a1420'],
            self::Cyan => ['#e0f7fb', '#0f2226'],
            self::Navy => ['#0f1b3d', '#0a1330'],
            self::Wine => ['#2a0f18', '#1c0a10'],
            self::Forest => ['#0c1f17', '#08150f'],
            self::Plum => ['#1e1030', '#140a20'],
            self::Graphite => ['#16181d', '#0e1013'],
            self::Ocean => ['#0a2233', '#06151f'],
        };
    }

    /**
     * Whether the *light-mode* background above is dark enough that the
     * sidebar/header text needs to flip to light — every other entry is a
     * light pastel and keeps the app's normal dark text.
     */
    public function isDarkInLightMode(): bool
    {
        return match ($this) {
            self::Default, self::Black, self::Slate, self::Navy, self::Wine, self::Forest, self::Plum, self::Graphite, self::Ocean => true,
            default => false,
        };
    }

    /**
     * @return array<int, array{value: string, label: string, swatch: string, isDark: bool}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $chrome) => [
                'value' => $chrome->value,
                'label' => $chrome->label(),
                'swatch' => $chrome->colors()[0],
                'isDark' => $chrome->isDarkInLightMode(),
            ],
            self::cases(),
        );
    }
}
