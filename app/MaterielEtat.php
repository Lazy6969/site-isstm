<?php

namespace App;

enum MaterielEtat: string
{
    case BonEtat = 'bon_etat';
    case EnMarche = 'en_marche';
    case MauvaisEtat = 'mauvais_etat';
    case EnPanne = 'en_panne';

    public function label(): string
    {
        return match ($this) {
            self::BonEtat => 'Bon état',
            self::EnMarche => 'En marche',
            self::MauvaisEtat => 'Mauvais état',
            self::EnPanne => 'En panne',
        };
    }
}
