<?php

namespace App;

enum ClassGroupType: string
{
    case Classe = 'classe';
    case Enseignants = 'enseignants';

    public function label(): string
    {
        return match ($this) {
            self::Classe => 'Classe',
            self::Enseignants => 'Enseignants',
        };
    }
}
