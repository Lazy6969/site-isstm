<?php

namespace App;

enum PostType: string
{
    case Actualite = 'actualite';
    case Resultat = 'resultat';
    case EmploiDuTemps = 'emploi_du_temps';
    case Examen = 'examen';
    case Media = 'media';
    case Autre = 'autre';

    public function label(): string
    {
        return match ($this) {
            self::Actualite => 'Actualité',
            self::Resultat => 'Résultat',
            self::EmploiDuTemps => 'Emploi du temps',
            self::Examen => 'Examen',
            self::Media => 'Média',
            self::Autre => 'Autre',
        };
    }
}
