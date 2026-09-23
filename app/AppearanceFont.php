<?php

namespace App;

enum AppearanceFont: string
{
    case InstrumentSans = 'instrument-sans';
    case Inter = 'inter';
    case Geist = 'geist';
    case Roboto = 'roboto';
    case Poppins = 'poppins';
    case Manrope = 'manrope';
    case NunitoSans = 'nunito-sans';
    case PlusJakartaSans = 'plus-jakarta-sans';

    public function label(): string
    {
        return match ($this) {
            self::InstrumentSans => 'Instrument Sans (défaut)',
            self::Inter => 'Inter',
            self::Geist => 'Geist',
            self::Roboto => 'Roboto',
            self::Poppins => 'Poppins',
            self::Manrope => 'Manrope',
            self::NunitoSans => 'Nunito Sans',
            self::PlusJakartaSans => 'Plus Jakarta Sans',
        };
    }

    /**
     * The Google Fonts family name(s), url-encoded, for the CSS `<link>`.
     * Instrument Sans is self-hosted via the Vite fonts plugin, so it needs none.
     */
    public function googleFontsFamily(): ?string
    {
        return match ($this) {
            self::InstrumentSans => null,
            self::Geist => 'Geist:wght@400;500;600;700',
            self::Roboto => 'Roboto:wght@400;500;700',
            self::Poppins => 'Poppins:wght@400;500;600;700',
            self::Manrope => 'Manrope:wght@400;500;600;700',
            self::NunitoSans => 'Nunito+Sans:wght@400;500;600;700',
            self::PlusJakartaSans => 'Plus+Jakarta+Sans:wght@400;500;600;700',
            self::Inter => 'Inter:wght@400;500;600;700',
        };
    }

    public function fontFamily(): string
    {
        return match ($this) {
            self::InstrumentSans => "'Instrument Sans'",
            self::Inter => "'Inter'",
            self::Geist => "'Geist'",
            self::Roboto => "'Roboto'",
            self::Poppins => "'Poppins'",
            self::Manrope => "'Manrope'",
            self::NunitoSans => "'Nunito Sans'",
            self::PlusJakartaSans => "'Plus Jakarta Sans'",
        }.', ui-sans-serif, system-ui, sans-serif';
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $font) => ['value' => $font->value, 'label' => $font->label()],
            self::cases(),
        );
    }
}
