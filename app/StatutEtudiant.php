<?php

namespace App;

enum StatutEtudiant: string
{
    case Actif = 'actif';
    case Suspendu = 'suspendu';
    case Diplome = 'diplome';
    case Abandon = 'abandon';

    public function label(): string
    {
        return match ($this) {
            self::Actif => 'Actif',
            self::Suspendu => 'Suspendu',
            self::Diplome => 'Diplômé',
            self::Abandon => 'Abandon',
        };
    }
}
