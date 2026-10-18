<?php

namespace App;

use App\Models\User;

/**
 * Where each kind of account lands after signing in through the single login
 * form. Spatie roles decide first (staff accounts carry one); the legacy
 * `users.role` column covers students and teachers.
 *
 * A landing page must never be one the account can't open (that is a 403 right
 * after login), so each staff role picks the first page it is *actually*
 * permitted to see — which also keeps working on a database whose roles were
 * seeded with an older permission list.
 */
class RoleHome
{
    /**
     * Pages a scolarité account may land on, best first.
     *
     * @var array<int, array{0: string, 1: string}> [permission, route name]
     */
    private const SCOLARITE_PAGES = [
        ['etudiants.view', 'admin.scolarite.etudiants.index'],
        ['preinscriptions.manage', 'admin.preinscriptions.index'],
        ['payments.view', 'admin.ecolage.index'],
        ['reactivations.manage', 'admin.reactivations.index'],
        ['dashboard.view', 'admin.dashboard'],
    ];

    public static function for(?User $user): string
    {
        if ($user === null) {
            return route('home');
        }

        if ($user->hasRole('super-admin') || $user->hasLegacyRole(Role::Admin)) {
            return route('admin.dashboard');
        }

        if ($user->hasRole('scolarite')) {
            return self::firstPermittedPage($user, self::SCOLARITE_PAGES) ?? self::staffFallback($user);
        }

        if ($user->hasRole('enseignant') || $user->hasLegacyRole(Role::Enseignant)) {
            // Their own console, limited to what their role allows; the community
            // feed stays one click away from its sidebar. An account without the
            // dashboard permission keeps the personal dashboard.
            return $user->can('dashboard.view') ? route('admin.dashboard') : route('dashboard.index');
        }

        if ($user->hasRole('etudiant') || $user->hasLegacyRole(Role::Etudiant)) {
            return route('posts.index');
        }

        if ($user->hasRole('responsable-materiel') || $user->hasLegacyRole(Role::Materiel)) {
            // Their own workspace (inventory, loans, repairs) — not the generic console.
            return $user->can('materiel.view') ? route('materiel.dashboard') : self::staffFallback($user);
        }

        return route('home');
    }

    /**
     * The admin dashboard when the account may open it, else the staff
     * messaging page, else the public site — never a page it can't see.
     */
    private static function staffFallback(User $user): string
    {
        if ($user->can('dashboard.view')) {
            return route('admin.dashboard');
        }

        return $user->is_messagerie ? route('staff-messages.index') : route('home');
    }

    /**
     * @param  array<int, array{0: string, 1: string}>  $pages
     */
    private static function firstPermittedPage(User $user, array $pages): ?string
    {
        foreach ($pages as [$permission, $routeName]) {
            if ($user->can($permission)) {
                return route($routeName);
            }
        }

        return null;
    }
}
