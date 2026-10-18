<?php

namespace App;

/**
 * The kinds of event written to a piece of equipment's history.
 */
enum MaterielMouvementType: string
{
    case Creation = 'creation';
    case Deplacement = 'deplacement';
    case Emprunt = 'emprunt';
    case Retour = 'retour';
    case Panne = 'panne';
    case Maintenance = 'maintenance';
    case Reparation = 'reparation';
    case RemiseEnService = 'remise_en_service';
    case Reforme = 'reforme';

    public function label(): string
    {
        return match ($this) {
            self::Creation => 'Ajout à l\'inventaire',
            self::Deplacement => 'Déplacement',
            self::Emprunt => 'Prêt',
            self::Retour => 'Retour',
            self::Panne => 'Panne signalée',
            self::Maintenance => 'Mise en maintenance',
            self::Reparation => 'Réparation commencée',
            self::RemiseEnService => 'Remise en service',
            self::Reforme => 'Réforme',
        };
    }
}
