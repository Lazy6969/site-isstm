<?php

namespace App;

/**
 * Where a piece of equipment stands right now. Every change goes through
 * App\Services\MaterielService so the history stays in step with it.
 */
enum MaterielStatut: string
{
    case Disponible = 'disponible';
    case Emprunte = 'emprunte';
    case EnMaintenance = 'en_maintenance';
    case EnPanne = 'en_panne';
    case Reforme = 'reforme';

    public function label(): string
    {
        return match ($this) {
            self::Disponible => 'Disponible',
            self::Emprunte => 'Emprunté',
            self::EnMaintenance => 'En maintenance',
            self::EnPanne => 'En panne',
            self::Reforme => 'Réformé',
        };
    }
}
