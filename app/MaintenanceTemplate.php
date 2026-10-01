<?php

namespace App;

/**
 * The maintenance page's tone — each carries its own default title/message,
 * editable per-choice from the admin's Maintenance settings (see
 * MaintenanceSettingsController). "Personnalisé" ships with empty defaults so
 * the admin's own text is never fighting a placeholder.
 */
enum MaintenanceTemplate: string
{
    case Maintenance = 'maintenance';
    case Indisponible = 'indisponible';
    case Personnalise = 'personnalise';

    public function label(): string
    {
        return match ($this) {
            self::Maintenance => 'Maintenance en cours',
            self::Indisponible => 'Site indisponible',
            self::Personnalise => 'Personnalisé',
        };
    }

    public function defaultTitle(): string
    {
        return match ($this) {
            self::Maintenance => 'Site en maintenance',
            self::Indisponible => 'Site temporairement indisponible',
            self::Personnalise => '',
        };
    }

    public function defaultMessage(): string
    {
        return match ($this) {
            self::Maintenance => 'Nous améliorons actuellement le site pour vous offrir une meilleure expérience. Merci de revenir dans quelques instants.',
            self::Indisponible => 'Le site est temporairement indisponible. Nous travaillons à le rétablir dès que possible.',
            self::Personnalise => '',
        };
    }

    /**
     * @return array<int, array{value: string, label: string, defaultTitle: string, defaultMessage: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $template) => [
                'value' => $template->value,
                'label' => $template->label(),
                'defaultTitle' => $template->defaultTitle(),
                'defaultMessage' => $template->defaultMessage(),
            ],
            self::cases(),
        );
    }
}
