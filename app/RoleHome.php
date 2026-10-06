<?php

namespace App;

use App\Models\User;

/**
 * Where each kind of account lands after signing in through the single login
 * form. Spatie roles decide first (staff accounts carry one); the legacy
 * `users.role` column covers students and teachers.
 */
class RoleHome
{
    public static function for(?User $user): string
    {
        if ($user === null) {
            return route('home');
        }

        if ($user->hasRole('super-admin') || $user->hasLegacyRole(Role::Admin)) {
            return route('admin.dashboard');
        }

        if ($user->hasRole('scolarite')) {
            return route('admin.scolarite.etudiants.index');
        }

        if ($user->hasRole('enseignant') || $user->hasLegacyRole(Role::Enseignant)) {
            return route('dashboard.index');
        }

        if ($user->hasRole('etudiant') || $user->hasLegacyRole(Role::Etudiant)) {
            return route('posts.index');
        }

        if ($user->hasRole('responsable-materiel') || $user->hasLegacyRole(Role::Materiel)) {
            if ($user->can('dashboard.view')) {
                return route('admin.dashboard');
            }

            return $user->is_messagerie ? route('staff-messages.index') : route('home');
        }

        return route('home');
    }
}
