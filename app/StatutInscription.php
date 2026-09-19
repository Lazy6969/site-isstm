<?php

namespace App;

enum StatutInscription: string
{
    case EnAttente = 'en_attente';
    case Validee = 'validee';
    case Annulee = 'annulee';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente',
            self::Validee => 'Validée',
            self::Annulee => 'Annulée',
        };
    }
}
