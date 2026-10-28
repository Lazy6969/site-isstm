<?php

namespace App;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\PermissionRegistrar;

/**
 * The permissions added for the student/teacher community space and the
 * finer-grained scolarité actions, plus who gets them out of the box.
 *
 * Every default grant mirrors the access the role already had before these
 * permissions existed, so installing them changes nothing until a Super Admin
 * edits a role from the Roles screen. Shared by the seeder (fresh installs)
 * and the migration (existing databases).
 */
class PermissionCatalog
{
    /**
     * Community space: feed, stories, friends, private messages, class groups.
     *
     * @var array<int, string>
     */
    public const COMMUNITY = [
        'community.view', 'community.post', 'community.comment', 'community.react',
        'stories.view', 'stories.create',
        'friends.manage',
        'messages.view', 'messages.send',
        'groups.view', 'groups.create', 'groups.join', 'groups.message', 'groups.announce', 'groups.presence', 'groups.moderate',
    ];

    /**
     * Only students re-enrol: the réinscription form is theirs alone.
     *
     * @var array<int, string>
     */
    public const STUDENT_ONLY = ['reinscription.submit'];

    /**
     * The student's own écolage page: see it, and declare a versement.
     *
     * @var array<int, string>
     */
    public const ECOLAGE_STUDENT = ['ecolage.view', 'ecolage.submit'];

    /**
     * Erasing entries of the journal d'activité (they go to the Corbeille).
     *
     * @var array<int, string>
     */
    public const ACTIVITY_LOG = ['activity-log.delete'];

    /**
     * Reviewing the versements students declare — a scolarité task.
     *
     * @var array<int, string>
     */
    public const PAYMENTS = ['payments.view', 'payments.validate', 'payments.refuse', 'payments.export', 'payments.delete'];

    /**
     * The "Résultats" admission list: importing/editing/archiving it — a
     * scolarité task, same footing as PAYMENTS.
     *
     * @var array<int, string>
     */
    public const RESULTATS = ['resultats.view', 'resultats.import', 'resultats.create', 'resultats.edit', 'resultats.delete', 'resultats.export'];

    /**
     * Inventaire du matériel : fiches, emprunts entre lieux et historique de
     * maintenance — la seule tâche du rôle `responsable-materiel`.
     *
     * @var array<int, string>
     */
    public const MATERIEL = ['materiel.view', 'materiel.create', 'materiel.edit', 'materiel.delete'];

    /**
     * The "Sécurité" screen: accepting or refusing the students' password-reset
     * requests. Super Admin only by default — it hands out access to accounts.
     *
     * @var array<int, string>
     */
    public const SECURITY = ['security.manage'];

    /**
     * Leçons/Sujets in the community feed's sidebar: any community member can
     * upload one (gated by `access:community.post`, not a permission of its
     * own — see routes/web.php), but approving/rejecting it, or deleting it
     * from the Corbeille, is Super Admin only by default.
     *
     * @var array<int, string>
     */
    public const COMMUNITY_DOCUMENTS = ['lecons-sujets.moderate', 'lecons-sujets.delete'];

    /**
     * Deleting an account from the "Gestion des comptes" screen — a step
     * above `users.edit`, which only lets an admin correct a profile.
     *
     * @var array<int, string>
     */
    public const ACCOUNTS = ['users.delete'];

    /**
     * The Maintenance screen's "Maintenance des données" panel: exporting a
     * full SQL dump, wiping every bit of site data, and pulling + building +
     * migrating the latest code. Far more dangerous than the rest of
     * Maintenance (`settings.manage`), so it is its own permission set and
     * stays Super Admin only by default.
     *
     * @var array<int, string>
     */
    public const SYSTEMDATA = ['systemdata.export', 'systemdata.wipe', 'systemdata.update'];

    /**
     * Finer scolarité actions, split out of the broader permissions below.
     *
     * @var array<string, array<int, string>> existing permission => new ones a role holding it inherits
     */
    public const INHERITED = [
        'preinscriptions.manage' => ['preinscriptions.export', 'preinscriptions.approve', 'preinscriptions.refuse'],
        'reactivations.manage' => ['reactivations.approve', 'reactivations.refuse', 'reactivations.delete'],
        'etudiants.view' => ['etudiants.export'],
        'etudiants.edit' => ['etudiants.pause'],
        'activity-log.view' => ['activity-log.delete'],
    ];

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return array_values(array_unique([
            ...self::COMMUNITY,
            ...self::STUDENT_ONLY,
            ...self::ECOLAGE_STUDENT,
            ...self::PAYMENTS,
            ...self::RESULTATS,
            ...self::MATERIEL,
            ...self::ACCOUNTS,
            ...self::SECURITY,
            ...self::ACTIVITY_LOG,
            ...self::COMMUNITY_DOCUMENTS,
            ...self::SYSTEMDATA,
            ...array_merge(...array_values(self::INHERITED)),
        ]));
    }

    /**
     * Creates just these permissions and gives them to the listed roles — what a
     * later migration uses, so it never re-grants anything an admin has since removed.
     *
     * @param  array<string, array<int, string>>  $grantsByRole
     */
    public static function installOnly(array $grantsByRole): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (array_unique(array_merge(...array_values($grantsByRole))) as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        foreach ($grantsByRole as $roleName => $permissions) {
            SpatieRole::where('name', $roleName)->where('guard_name', 'web')->first()?->givePermissionTo($permissions);
        }

        SpatieRole::where('name', 'super-admin')->where('guard_name', 'web')->first()?->givePermissionTo(array_unique(array_merge(...array_values($grantsByRole))));

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Creates every permission and gives each role what it already could do.
     * Additive: never removes a permission, so it is safe to run repeatedly.
     */
    public static function install(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::all() as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $grants = [
            'etudiant' => [...self::COMMUNITY, ...self::STUDENT_ONLY, ...self::ECOLAGE_STUDENT],
            'scolarite' => [...self::PAYMENTS, ...self::RESULTATS],
            'responsable-materiel' => self::MATERIEL,
            'enseignant' => self::COMMUNITY,
        ];

        foreach ($grants as $roleName => $permissions) {
            SpatieRole::where('name', $roleName)->where('guard_name', 'web')->first()?->givePermissionTo($permissions);
        }

        foreach (SpatieRole::where('guard_name', 'web')->where('name', '!=', 'super-admin')->get() as $role) {
            foreach (self::INHERITED as $existing => $inherited) {
                if ($role->permissions->contains('name', $existing)) {
                    $role->givePermissionTo($inherited);
                }
            }
        }

        SpatieRole::where('name', 'super-admin')->where('guard_name', 'web')->first()?->givePermissionTo(self::all());

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
