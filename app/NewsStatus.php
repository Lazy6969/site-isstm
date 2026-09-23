<?php

namespace App;

enum NewsStatus: string
{
    case Brouillon = 'brouillon';
    case EnAttente = 'en_attente';
    case Publie = 'publie';
    case Rejete = 'rejete';
    case Archive = 'archive';

    public function label(): string
    {
        return match ($this) {
            self::Brouillon => 'Brouillon',
            self::EnAttente => 'En attente',
            self::Publie => 'Publié',
            self::Rejete => 'Rejeté',
            self::Archive => 'Archivé',
        };
    }
}
