<?php

namespace App\Services;

use App\Models\Materiel;
use App\Models\MaterielDeplacement;
use App\Models\MaterielMaintenance;

/**
 * Shapes a Materiel for the admin page — value + label for its état, and its
 * maintenance/déplacement history presented the same way. Callers must
 * eager-load ['maintenances.creePar:id,name', 'deplacements.creePar:id,name'].
 */
class MaterielPresenter
{
    /**
     * @return array<string, mixed>
     */
    public function present(Materiel $materiel): array
    {
        return [
            'id' => $materiel->id,
            'lieu' => $materiel->lieu,
            'nom' => $materiel->nom,
            'quantite' => $materiel->quantite,
            'etat' => $materiel->etat->value,
            'etat_label' => $materiel->etat->label(),
            'observation' => $materiel->observation,
            'created_at' => $materiel->created_at,
            'maintenances' => $materiel->maintenances->map(fn (MaterielMaintenance $m) => [
                'id' => $m->id,
                'description' => $m->description,
                'etat_apres' => $m->etat_apres?->value,
                'etat_apres_label' => $m->etat_apres?->label(),
                'created_at' => $m->created_at,
            ]),
            'deplacements' => $materiel->deplacements->map(fn (MaterielDeplacement $d) => [
                'id' => $d->id,
                'lieu_origine' => $d->lieu_origine,
                'lieu_destination' => $d->lieu_destination,
                'motif' => $d->motif,
                'emprunteur' => $d->emprunteur,
                'quantite' => $d->quantite,
                'statut' => $d->statut->value,
                'statut_label' => $d->statut->label(),
                'created_at' => $d->created_at,
                'date_retour' => $d->date_retour,
            ]),
        ];
    }
}
