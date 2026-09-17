<?php

namespace App;

enum MemoireCategorie: string
{
    case Memoire = 'Mémoire';
    case Projet = 'Projet';

    public function label(): string
    {
        return match ($this) {
            self::Memoire => 'Mémoire',
            self::Projet => 'Projet',
        };
    }
}
