<?php

namespace App\Services;

use App\Exceptions\MaterielException;
use App\MaterielMouvementType;
use App\MaterielStatut;
use App\Models\Materiel;
use App\Models\MaterielEmprunt;
use App\Models\MaterielIntervention;
use App\Models\MaterielMouvement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Every change to a piece of equipment goes through here, so its statut, its
 * loans, its repairs and its history can never drift apart. Each method checks
 * that the move makes sense from the current statut and throws a
 * MaterielException (with a message fit for the user) when it doesn't.
 */
class MaterielService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function register(array $data, ?User $by): Materiel
    {
        return DB::transaction(function () use ($data, $by) {
            $materiel = Materiel::create([
                ...$data,
                'code' => $data['code'] ?? Materiel::generateCode(),
                'statut' => MaterielStatut::Disponible,
            ]);

            $this->log($materiel, MaterielMouvementType::Creation, null, $materiel->localisation, 'Ajouté à l\'inventaire.', $by);

            return $materiel;
        });
    }

    public function move(Materiel $materiel, string $vers, ?string $note, ?User $by): Materiel
    {
        $this->ensureNot($materiel, [MaterielStatut::Emprunte, MaterielStatut::Reforme], 'Ce matériel est prêté ou réformé : il ne peut pas être déplacé.');

        $vers = trim($vers);
        if ($vers === '' || $vers === $materiel->localisation) {
            throw new MaterielException('Indiquez une nouvelle localisation différente de l\'actuelle.');
        }

        return DB::transaction(function () use ($materiel, $vers, $note, $by) {
            $de = $materiel->localisation;
            $materiel->update(['localisation' => $vers]);
            $this->log($materiel, MaterielMouvementType::Deplacement, $de, $vers, $note, $by);

            return $materiel;
        });
    }

    /**
     * @param  array{emprunteur_nom: string, emprunteur_type: string, emprunteur_reference?: ?string, emprunteur_contact?: ?string, motif?: ?string, date_sortie: string, date_retour_prevue: string}  $data
     */
    public function lend(Materiel $materiel, array $data, ?User $by): MaterielEmprunt
    {
        $this->ensure($materiel, [MaterielStatut::Disponible], 'Seul un matériel disponible peut être prêté.');

        return DB::transaction(function () use ($materiel, $data, $by) {
            $emprunt = $materiel->emprunts()->create([...$data, 'prete_par' => $by?->id]);
            $materiel->update(['statut' => MaterielStatut::Emprunte]);
            $this->log($materiel, MaterielMouvementType::Emprunt, $materiel->localisation, $data['emprunteur_nom'], $data['motif'] ?? null, $by);

            return $emprunt;
        });
    }

    /**
     * A matériel handed back damaged is not put back on the shelf: a breakdown
     * is opened for it straight away.
     */
    public function giveBack(MaterielEmprunt $emprunt, string $etat, ?string $note, ?User $by): MaterielEmprunt
    {
        if ($emprunt->date_retour_effective !== null) {
            throw new MaterielException('Ce prêt est déjà clôturé.');
        }

        return DB::transaction(function () use ($emprunt, $etat, $note, $by) {
            $materiel = $emprunt->materiel;

            $emprunt->update([
                'date_retour_effective' => today(),
                'etat_au_retour' => $etat,
                'note_retour' => $note,
                'recu_par' => $by?->id,
            ]);

            $this->log($materiel, MaterielMouvementType::Retour, $emprunt->emprunteur_nom, $materiel->localisation, $note, $by);

            if ($etat === 'endommage') {
                $materiel->update(['statut' => MaterielStatut::EnPanne]);
                $materiel->interventions()->create([
                    'type' => 'panne',
                    'titre' => 'Endommagé au retour du prêt',
                    'description' => $note,
                    'date_debut' => today(),
                    'signale_par' => $by?->id,
                ]);
                $this->log($materiel, MaterielMouvementType::Panne, null, null, 'Rendu endommagé par '.$emprunt->emprunteur_nom.'.', $by);
            } else {
                $materiel->update(['statut' => MaterielStatut::Disponible]);
            }

            return $emprunt;
        });
    }

    public function reportBreakdown(Materiel $materiel, string $titre, ?string $description, ?User $by): MaterielIntervention
    {
        $this->ensure($materiel, [MaterielStatut::Disponible], 'Une panne se déclare sur un matériel disponible : si le matériel est prêté, enregistrez d\'abord son retour.');

        return DB::transaction(function () use ($materiel, $titre, $description, $by) {
            $intervention = $materiel->interventions()->create([
                'type' => 'panne',
                'titre' => $titre,
                'description' => $description,
                'date_debut' => today(),
                'signale_par' => $by?->id,
            ]);
            $materiel->update(['statut' => MaterielStatut::EnPanne]);
            $this->log($materiel, MaterielMouvementType::Panne, null, null, $titre, $by);

            return $intervention;
        });
    }

    /**
     * Puts the matériel into maintenance: either a planned maintenance on an
     * available item, or the repair of one that is broken (the open breakdown
     * becomes the repair).
     */
    public function startMaintenance(Materiel $materiel, string $type, string $titre, ?string $description, ?string $prestataire, ?User $by): MaterielIntervention
    {
        $this->ensure($materiel, [MaterielStatut::Disponible, MaterielStatut::EnPanne], 'Seul un matériel disponible ou en panne peut être mis en maintenance.');

        return DB::transaction(function () use ($materiel, $type, $titre, $description, $prestataire, $by) {
            $open = $materiel->statut === MaterielStatut::EnPanne ? $materiel->interventionOuverte : null;

            if ($open !== null) {
                $open->update([
                    'type' => 'reparation',
                    'prestataire' => $prestataire ?? $open->prestataire,
                    'description' => $description ?: $open->description,
                ]);
                $intervention = $open;
                $logType = MaterielMouvementType::Reparation;
            } else {
                $intervention = $materiel->interventions()->create([
                    'type' => $type,
                    'titre' => $titre,
                    'description' => $description,
                    'prestataire' => $prestataire,
                    'date_debut' => today(),
                    'signale_par' => $by?->id,
                ]);
                $logType = $type === 'reparation' ? MaterielMouvementType::Reparation : MaterielMouvementType::Maintenance;
            }

            $materiel->update(['statut' => MaterielStatut::EnMaintenance]);
            $this->log($materiel, $logType, null, null, $titre, $by);

            return $intervention;
        });
    }

    public function finishIntervention(MaterielIntervention $intervention, ?string $resolution, ?int $cout, ?User $by): MaterielIntervention
    {
        if (! $intervention->isOuverte()) {
            throw new MaterielException('Cette intervention est déjà terminée.');
        }

        return DB::transaction(function () use ($intervention, $resolution, $cout, $by) {
            $materiel = $intervention->materiel;

            $intervention->update([
                'date_fin' => today(),
                'resolution' => $resolution,
                'cout' => $cout,
                'cloture_par' => $by?->id,
            ]);

            if (in_array($materiel->statut, [MaterielStatut::EnPanne, MaterielStatut::EnMaintenance], true)) {
                $materiel->update(['statut' => MaterielStatut::Disponible]);
            }

            $this->log($materiel, MaterielMouvementType::RemiseEnService, null, $materiel->localisation, $resolution, $by);

            return $intervention;
        });
    }

    public function reform(Materiel $materiel, ?string $note, ?User $by): Materiel
    {
        $this->ensureNot($materiel, [MaterielStatut::Emprunte, MaterielStatut::Reforme], 'Un matériel prêté ou déjà réformé ne peut pas être réformé.');

        return DB::transaction(function () use ($materiel, $note, $by) {
            $materiel->interventions()->whereNull('date_fin')->update([
                'date_fin' => today(),
                'resolution' => 'Matériel réformé.',
                'cloture_par' => $by?->id,
            ]);
            $materiel->update(['statut' => MaterielStatut::Reforme]);
            $this->log($materiel, MaterielMouvementType::Reforme, $materiel->localisation, null, $note, $by);

            return $materiel;
        });
    }

    private function log(Materiel $materiel, MaterielMouvementType $type, ?string $de, ?string $vers, ?string $note, ?User $by): void
    {
        MaterielMouvement::create([
            'materiel_id' => $materiel->id,
            'type' => $type,
            'de' => $de,
            'vers' => $vers,
            'note' => $note,
            'user_id' => $by?->id,
        ]);
    }

    /**
     * @param  array<int, MaterielStatut>  $allowed
     */
    private function ensure(Materiel $materiel, array $allowed, string $message): void
    {
        if (! in_array($materiel->statut, $allowed, true)) {
            throw new MaterielException($message);
        }
    }

    /**
     * @param  array<int, MaterielStatut>  $forbidden
     */
    private function ensureNot(Materiel $materiel, array $forbidden, string $message): void
    {
        if (in_array($materiel->statut, $forbidden, true)) {
            throw new MaterielException($message);
        }
    }
}
