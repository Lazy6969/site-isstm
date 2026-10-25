<?php

namespace App;

enum PasswordResetRequestStatus: string
{
    case EnAttente = 'en_attente';
    case Accepte = 'accepte';
    case Refuse = 'refuse';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente',
            self::Accepte => 'Acceptée',
            self::Refuse => 'Refusée',
        };
    }
}
