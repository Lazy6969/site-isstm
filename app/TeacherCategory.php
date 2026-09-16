<?php

namespace App;

enum TeacherCategory: string
{
    case Permanent = 'permanent';
    case Vacataire = 'vacataire';

    public function label(): string
    {
        return match ($this) {
            self::Permanent => 'Enseignant permanent',
            self::Vacataire => 'Enseignant vacataire',
        };
    }
}
