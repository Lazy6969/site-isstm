<?php

namespace App;

enum AnnouncementType: string
{
    case Examen = 'examen';
    case Resultat = 'resultat';
    case Devoir = 'devoir';
    case Autre = 'autre';

    public function label(): string
    {
        return match ($this) {
            self::Examen => 'Examen',
            self::Resultat => 'Résultat',
            self::Devoir => 'Devoir',
            self::Autre => 'Autre',
        };
    }
}
