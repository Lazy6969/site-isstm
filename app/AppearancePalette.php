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

    public function label(): string
    {
        return match ($this) {
            self::Default => 'Défaut (indigo)',
            self::Blue => 'Bleu',
            self::Emerald => 'Émeraude',
            self::Violet => 'Violet',
            self::Amber => 'Ambre',
            self::Rose => 'Rose',
            self::Cyan => 'Cyan',
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
            self::Default => ['#4f46e5', '#ffffff', '#6366f1', '#ffffff'],
            self::Blue => ['#2563eb', '#ffffff', '#3b82f6', '#ffffff'],
            self::Emerald => ['#059669', '#ffffff', '#10b981', '#ffffff'],
            self::Violet => ['#7c3aed', '#ffffff', '#8b5cf6', '#ffffff'],
            self::Amber => ['#d97706', '#111827', '#f59e0b', '#111827'],
            self::Rose => ['#e11d48', '#ffffff', '#f43f5e', '#ffffff'],
            self::Cyan => ['#0891b2', '#ffffff', '#22d3ee', '#111827'],
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
