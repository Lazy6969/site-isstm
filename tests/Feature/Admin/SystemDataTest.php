<?php

use App\Models\ActivityLog;
use App\Models\Filiere;
use App\Models\Setting;
use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\Process;

it('forbids a non-super-admin from exporting, wiping or updating site data', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/settings/maintenance/data/export')->assertForbidden();
    $this->actingAs($etudiant)->delete('/console/settings/maintenance/data/wipe', ['confirmation' => 'SUPPRIMER'])->assertForbidden();
    $this->actingAs($etudiant)->post('/console/settings/maintenance/data/update')->assertForbidden();
});

it('lets the super admin download a full SQL export of the database', function () {
    Process::fake();
    $admin = User::factory()->role(Role::Admin)->create();

    $response = $this->actingAs($admin)->get('/console/settings/maintenance/data/export');

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('.sql');
    expect(ActivityLog::where('action', 'system_data_exported')->exists())->toBeTrue();
});

it('refuses to wipe data without the exact confirmation phrase', function () {
    Process::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    Filiere::factory()->create();

    $this->actingAs($admin)
        ->delete('/console/settings/maintenance/data/wipe', ['confirmation' => 'pas sûr'])
        ->assertStatus(422);

    expect(Filiere::count())->toBe(1);
});

it('wipes every table of site data but keeps admin accounts and the site setup', function () {
    Process::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    Filiere::factory()->create();
    Setting::set('maintenance.enabled', 'false');

    $this->actingAs($admin)
        ->delete('/console/settings/maintenance/data/wipe', ['confirmation' => 'SUPPRIMER'])
        ->assertRedirect();

    expect(Filiere::count())->toBe(0)
        ->and(User::find($admin->id))->not->toBeNull()
        ->and(User::find($student->id))->toBeNull()
        ->and(Setting::get('maintenance.enabled'))->toBe('false')
        ->and(ActivityLog::where('action', 'system_data_wiped')->exists())->toBeTrue();
});

it('runs the full update pipeline and reports success when every step succeeds', function () {
    Process::fake();
    $admin = User::factory()->role(Role::Admin)->create();

    $response = $this->actingAs($admin)->post('/console/settings/maintenance/data/update');

    $response->assertRedirect();
    $response->assertSessionHas('systemUpdateLog', fn ($log) => count($log) === 5 && collect($log)->every(fn ($step) => $step['status'] === 'success'));
    expect(ActivityLog::where('action', 'system_update_succeeded')->exists())->toBeTrue();
});

it('stops the update pipeline at the first failed step and skips the rest', function () {
    Process::fake([
        '*git*status*porcelain*' => Process::result(output: ''),
        '*git*pull*' => Process::result(output: 'Already up to date.'),
        '*composer*install*' => Process::result(exitCode: 1, errorOutput: 'Dependency conflict'),
        '*' => Process::result(output: 'should not run'),
    ]);
    $admin = User::factory()->role(Role::Admin)->create();

    $response = $this->actingAs($admin)->post('/console/settings/maintenance/data/update');

    $response->assertRedirect();
    $response->assertSessionHas('systemUpdateLog', function ($log) {
        return $log[0]['status'] === 'success'
            && $log[1]['status'] === 'failed'
            && $log[2]['status'] === 'skipped'
            && $log[3]['status'] === 'skipped'
            && $log[4]['status'] === 'skipped';
    });
    expect(ActivityLog::where('action', 'system_update_failed')->exists())->toBeTrue();
});

it('cancels the update when the server has uncommitted local changes', function () {
    Process::fake([
        '*git*status*porcelain*' => Process::result(output: ' M app/Http/Controllers/Controller.php'),
        '*' => Process::result(output: 'should not run'),
    ]);
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/settings/maintenance/data/update')
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(ActivityLog::where('action', 'system_update_succeeded')->exists())->toBeFalse()
        ->and(ActivityLog::where('action', 'system_update_failed')->exists())->toBeFalse();
});
