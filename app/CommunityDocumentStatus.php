<?php

namespace App;

enum CommunityDocumentStatus: string
{
    case EnAttente = 'en_attente';
    case Valide = 'valide';
    case Rejete = 'rejete';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente',
            self::Valide => 'Validé',
            self::Rejete => 'Rejeté',
        };
    }
}
