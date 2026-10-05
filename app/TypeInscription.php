<?php

namespace App;

enum TypeInscription: string
{
    case Reinscription = 'reinscription';
    case Redoublement = 'redoublement';

    public function label(): string
    {
        return match ($this) {
            self::Reinscription => 'Réinscription',
            self::Redoublement => 'Redoublant',
        };
    }
}
