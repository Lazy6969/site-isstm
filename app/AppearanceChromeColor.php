<?php

namespace App;

enum AppearanceChromeColor: string
{
    case Default = 'default';
    case White = 'white';
    case Blue = 'blue';
    case Emerald = 'emerald';
    case Violet = 'violet';
    case Amber = 'amber';
    case Rose = 'rose';
    case Cyan = 'cyan';

    public function label(): string
    {
        return match ($this) {
            self::Default => 'Défaut (indigo clair)',
            self::White => 'Blanc neutre',
            self::Blue => 'Bleu',
            self::Emerald => 'Émeraude',
            self::Violet => 'Violet',
            self::Amber => 'Ambre',
            self::Rose => 'Rose',
            self::Cyan => 'Cyan',
        };
    }

    /**
     * [light background, dark background] for the sidebar + header only
     * (--color-admin-chrome) — deliberately soft/desaturated tints, never the
     * saturated accent color, so the nav stays readable and non-fatiguing.
     *
     * @return array{0: string, 1: string}
     */
    public function colors(): array
    {
        return match ($this) {
            self::Default => ['#eef2ff', '#141a30'],
            self::White => ['#ffffff', '#10141d'],
            self::Blue => ['#e0edff', '#101b30'],
            self::Emerald => ['#e3f8ef', '#0f2019'],
            self::Violet => ['#f1eaff', '#1c1730'],
            self::Amber => ['#fdf2e2', '#2a2013'],
            self::Rose => ['#fde8ef', '#2a1420'],
            self::Cyan => ['#e0f7fb', '#0f2226'],
        };
    }

    /**
     * @return array<int, array{value: string, label: string, swatch: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $chrome) => ['value' => $chrome->value, 'label' => $chrome->label(), 'swatch' => $chrome->colors()[0]],
            self::cases(),
        );
    }
}
