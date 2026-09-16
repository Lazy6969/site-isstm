<?php

namespace App;

enum Role: string
{
    case Admin = 'admin';
    case Enseignant = 'enseignant';
    case Etudiant = 'etudiant';
    case User = 'user';
    case Bibliotheque = 'bibliotheque';
    case Materiel = 'materiel';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrateur',
            self::Enseignant => 'Enseignant',
            self::Etudiant => 'Étudiant',
            self::User => 'Utilisateur',
            self::Bibliotheque => 'Bibliothèque',
            self::Materiel => 'Matériel',
        };
    }
}
