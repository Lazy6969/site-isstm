<?php

namespace App;

enum GroupMemberRole: string
{
    case Enseignant = 'enseignant';
    case Etudiant = 'etudiant';

    public function label(): string
    {
        return match ($this) {
            self::Enseignant => 'Enseignant',
            self::Etudiant => 'Étudiant',
        };
    }
}
