<?php

namespace App;

enum AppearancePalette: string
{
    case Default = 'default';
    case Blue = 'blue';
    case Emerald = 'emerald';
    case Violet = 'violet';
    case Amber = 'amber';
    case Rose = 'rose';
    case Cyan = 'cyan';
    case Indigo = 'indigo';
    case Orange = 'orange';
    case Pink = 'pink';
    case Teal = 'teal';
    case Lime = 'lime';
    case Fuchsia = 'fuchsia';
    case Sky = 'sky';

    public function label(): string
    {
        return match ($this) {
            self::Default => 'Défaut (rouge ISSTM)',
            self::Blue => 'Bleu',
            self::Emerald => 'Émeraude',
            self::Violet => 'Violet',
            self::Amber => 'Ambre',
            self::Rose => 'Rose',
            self::Cyan => 'Cyan',
            self::Indigo => 'Indigo',
            self::Orange => 'Orange',
            self::Pink => 'Rose bonbon',
            self::Teal => 'Sarcelle',
            self::Lime => 'Vert citron',
            self::Fuchsia => 'Fuchsia',
            self::Sky => 'Bleu ciel',
        };
    }

    /**
     * [light accent, light accent-foreground, dark accent, dark accent-foreground].
     *
     * @return array{0: string, 1: string, 2: string, 3: string}
     */
    public function colors(): array
    {
        return match ($this) {
            self::Default => ['#e11d3f', '#ffffff', '#f0223f', '#ffffff'],
            self::Blue => ['#2563eb', '#ffffff', '#3b82f6', '#ffffff'],
            self::Emerald => ['#059669', '#ffffff', '#10b981', '#ffffff'],
            self::Violet => ['#7c3aed', '#ffffff', '#8b5cf6', '#ffffff'],
            self::Amber => ['#d97706', '#111827', '#f59e0b', '#111827'],
            self::Rose => ['#e11d48', '#ffffff', '#f43f5e', '#ffffff'],
            self::Cyan => ['#0891b2', '#ffffff', '#22d3ee', '#111827'],
            self::Indigo => ['#4f46e5', '#ffffff', '#6366f1', '#ffffff'],
            self::Orange => ['#ea580c', '#ffffff', '#fb923c', '#111827'],
            self::Pink => ['#db2777', '#ffffff', '#ec4899', '#ffffff'],
            self::Teal => ['#0d9488', '#ffffff', '#2dd4bf', '#111827'],
            self::Lime => ['#65a30d', '#ffffff', '#a3e635', '#111827'],
            self::Fuchsia => ['#c026d3', '#ffffff', '#d946ef', '#ffffff'],
            self::Sky => ['#0284c7', '#ffffff', '#38bdf8', '#111827'],
        };
    }

    /**
     * @return array<int, array{value: string, label: string, swatch: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $palette) => ['value' => $palette->value, 'label' => $palette->label(), 'swatch' => $palette->colors()[0]],
            self::cases(),
        );
    }
}
