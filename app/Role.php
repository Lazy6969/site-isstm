<?php

namespace App;

enum Role: string
{
    case Admin = 'admin';
    case Enseignant = 'enseignant';
    case Etudiant = 'etudiant';
    case User = 'user';
    case Materiel = 'materiel';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrateur',
            self::Enseignant => 'Enseignant',
            self::Etudiant => 'Étudiant',
            self::User => 'Utilisateur',
            self::Materiel => 'Matériel',
        };
    }

    /**
     * The equivalent Spatie Permission role name, or null when this legacy
     * value has no Spatie counterpart (kept only as the `users.role` default).
     */
    public function spatieRole(): ?string
    {
        return match ($this) {
            self::Admin => 'super-admin',
            self::Enseignant => 'enseignant',
            self::Etudiant => 'etudiant',
            self::Materiel => 'responsable-materiel',
            self::User => null,
        };
    }
}
