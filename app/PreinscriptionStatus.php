<?php

namespace App;

enum PreinscriptionStatus: string
{
    case Brouillon = 'brouillon';
    case Soumis = 'en_attente';
    case EnExamen = 'en_cours_examen';
    case ACompleter = 'a_completer';
    case Accepte = 'approuve';
    case Refuse = 'refuse';

    public function label(): string
    {
        return match ($this) {
            self::Brouillon => 'Brouillon',
            self::Soumis => 'Soumis',
            self::EnExamen => 'En cours d\'examen',
            self::ACompleter => 'À compléter',
            self::Accepte => 'Acceptée',
            self::Refuse => 'Refusée',
        };
    }
}
