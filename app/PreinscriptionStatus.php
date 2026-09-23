<?php

namespace App;

enum PreinscriptionStatus: string
{
    case Soumis = 'en_attente';
    case Accepte = 'approuve';
    case Refuse = 'refuse';

    public function label(): string
    {
        return match ($this) {
            self::Soumis => 'Soumis',
            self::Accepte => 'Acceptée',
            self::Refuse => 'Refusée',
        };
    }
}
