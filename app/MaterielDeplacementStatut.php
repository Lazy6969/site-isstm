<?php

namespace App;

enum MaterielDeplacementStatut: string
{
    case EnCours = 'en_cours';
    case Retourne = 'retourne';

    public function label(): string
    {
        return match ($this) {
            self::EnCours => 'En cours',
            self::Retourne => 'Retourné',
        };
    }
}
