<?php

namespace App;

enum ReactivationStatus: string
{
    case EnAttente = 'en_attente';
    case Approuvee = 'approuvee';
    case Refusee = 'refusee';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente',
            self::Approuvee => 'Approuvée',
            self::Refusee => 'Refusée',
        };
    }
}
