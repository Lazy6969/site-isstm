<?php

namespace App;

enum PreinscriptionStatus: string
{
    case EnAttente = 'en_attente';
    case Approuve = 'approuve';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente',
            self::Approuve => 'Approuvée',
        };
    }
}
