<?php

namespace App;

enum StatutInscription: string
{
    case Brouillon = 'brouillon';
    case EnAttente = 'en_attente';
    case EnExamen = 'en_cours_examen';
    case ACompleter = 'a_completer';
    case Validee = 'validee';
    case Annulee = 'annulee';

    public function label(): string
    {
        return match ($this) {
            self::Brouillon => 'Brouillon',
            self::EnAttente => 'En attente',
            self::EnExamen => 'En cours d\'examen',
            self::ACompleter => 'À compléter',
            self::Validee => 'Validée',
            self::Annulee => 'Annulée',
        };
    }
}
