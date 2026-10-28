<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * The Maintenance screen's "Maintenance des données" panel — exporting a
 * full SQL dump, wiping every bit of site data, and pulling + building +
 * migrating the latest code straight from the admin. Far more dangerous
 * than the rest of Maintenance, so every action here is gated behind its
 * own `systemdata.*` permission (Super Admin only by default, see
 * PermissionCatalog::SYSTEMDATA) and logged to the activity log.
 */
class SystemDataController extends Controller
{
    /**
     * Tables a wipe never touches: framework/session/queue plumbing, the
     * permission system itself, the `users` table (handled separately — only
     * non-admin accounts are removed, see wipe()), and the site's own setup
     * (Settings, quick-edit content, audit logs). "Site data" means the
     * operational records inside that setup, not the setup itself.
     *
     * @var array<int, string>
     */
    private const PROTECTED_TABLES = [
        'migrations', 'sessions', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs',
        'password_reset_tokens',
        'permissions', 'roles', 'model_has_permissions', 'model_has_roles', 'role_has_permissions',
        'users',
        'settings', 'site_contents', 'site_content_revisions',
        'activity_logs', 'security_logs',
    ];

    private const WIPE_CONFIRMATION_PHRASE = 'SUPPRIMER';

    private const ADMIN_ROLES = ['super-admin'];

    /**
     * Streams a full dump of the application database as plain SQL — the
     * file is re-importable as-is with `mysql <db> < fichier.sql`.
     */
    public function export(): BinaryFileResponse
    {
        $path = $this->dump('db-export-'.now()->format('Ymd-His').'-'.uniqid().'.sql');

        ActivityLog::record('system_data_exported', 'Export complet de la base de données téléchargé');

        return response()->download($path, 'isstm-'.now()->format('Y-m-d_H-i-s').'.sql')->deleteFileAfterSend();
    }

    /**
     * Wipes every table of site data, keeping only the admin accounts (so
     * nobody gets locked out) and the framework/permission plumbing. An
     * automatic backup lands in storage/app/backups first, as a safety net.
     */
    public function wipe(Request $request): RedirectResponse
    {
        $validated = $request->validate(['confirmation' => ['required', 'string']]);

        abort_unless($validated['confirmation'] === self::WIPE_CONFIRMATION_PHRASE, 422, 'Phrase de confirmation incorrecte.');

        $this->dump('backups/avant-suppression-'.now()->format('Ymd-His').'.sql');

        $removedUsers = User::query()->whereDoesntHave('roles', fn ($q) => $q->whereIn('name', self::ADMIN_ROLES))->count();
        User::query()->whereDoesntHave('roles', fn ($q) => $q->whereIn('name', self::ADMIN_ROLES))->delete();

        Schema::disableForeignKeyConstraints();
        foreach (Schema::getTableListing(schemaQualified: false) as $table) {
            if (! in_array($table, self::PROTECTED_TABLES, true)) {
                DB::table($table)->truncate();
            }
        }
        Schema::enableForeignKeyConstraints();

        ActivityLog::record('system_data_wiped', "Toutes les données du site ont été supprimées ({$removedUsers} comptes non-admin retirés), comptes admin conservés");

        return back()->with('status', 'Toutes les données du site ont été supprimées. Les comptes admin sont conservés. Une sauvegarde a été enregistrée sur le serveur avant la suppression.');
    }

    /**
     * Pulls the latest code, installs dependencies, builds the frontend and
     * applies pending migrations — the same pipeline run by hand from a
     * terminal, triggered from the admin instead. Stops at the first failed
     * step and reports exactly which one, instead of pressing on.
     */
    public function update(Request $request): RedirectResponse
    {
        set_time_limit(0);

        $dirty = Process::path(base_path())->run(['git', 'status', '--porcelain']);
        if (trim($dirty->output()) !== '') {
            return back()->with('error', 'Mise à jour annulée : des modifications locales non commitées existent sur le serveur. Il faut les nettoyer ou les commiter avant de mettre à jour.');
        }

        $steps = [
            ['label' => 'git pull', 'command' => ['git', 'pull']],
            ['label' => 'composer install', 'command' => ['composer', 'install']],
            ['label' => 'npm install', 'command' => ['npm', 'install']],
            ['label' => 'npm run build', 'command' => ['npm', 'run', 'build']],
            ['label' => 'php artisan migrate --force', 'command' => [PHP_BINARY, 'artisan', 'migrate', '--force']],
        ];

        $log = [];
        $failed = false;

        foreach ($steps as $step) {
            if ($failed) {
                $log[] = ['label' => $step['label'], 'status' => 'skipped', 'output' => ''];

                continue;
            }

            $process = Process::path(base_path())->timeout(600)->run($step['command']);
            $success = $process->successful();

            $log[] = [
                'label' => $step['label'],
                'status' => $success ? 'success' : 'failed',
                'output' => trim($process->output()."\n".$process->errorOutput()),
            ];

            $failed = ! $success;
        }

        ActivityLog::record(
            $failed ? 'system_update_failed' : 'system_update_succeeded',
            $failed ? 'Mise à jour du site interrompue par une erreur' : 'Site mis à jour (git pull, dépendances, build, migrations)',
        );

        return back()
            ->with($failed ? 'error' : 'status', $failed
                ? "La mise à jour s'est arrêtée à l'étape « ".($log[count($log) - 1]['label'] ?? '').' ».'
                : 'Site mis à jour avec succès.')
            ->with('systemUpdateLog', $log);
    }

    /**
     * Runs mysqldump against the default connection and writes its output to
     * $relativePath on the `local` disk (storage/app) — returns the absolute
     * path, ready for response()->download().
     */
    private function dump(string $relativePath): string
    {
        $config = config('database.connections.'.config('database.default'));

        $process = Process::timeout(300)->run([
            $this->mysqldumpBinary(),
            '-h', (string) ($config['host'] ?? '127.0.0.1'),
            '-P', (string) ($config['port'] ?? 3306),
            '-u', (string) ($config['username'] ?? ''),
            ...((($config['password'] ?? '') !== '') ? ["-p{$config['password']}"] : []),
            '--single-transaction',
            '--routines',
            (string) ($config['database'] ?? ''),
        ]);

        abort_unless($process->successful(), 500, "Échec de l'export de la base de données : ".trim($process->errorOutput()));

        Storage::disk('local')->put($relativePath, $process->output());

        return Storage::disk('local')->path($relativePath);
    }

    private function mysqldumpBinary(): string
    {
        if ($configured = env('MYSQLDUMP_PATH')) {
            return $configured;
        }

        foreach ([
            'C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqldump.exe',
            'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe',
            'C:/xampp/mysql/bin/mysqldump.exe',
        ] as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return 'mysqldump';
    }
}
