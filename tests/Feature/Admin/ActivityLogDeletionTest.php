<?php

use App\Models\ActivityLog;
use App\Models\User;
use App\Role;

function logEntry(string $description = 'Action de test'): ActivityLog
{
    return ActivityLog::create(['user_name' => 'Admin', 'action' => 'test_action', 'description' => $description]);
}

it('moves a journal entry to the corbeille instead of erasing it', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $entry = logEntry();

    $this->actingAs($admin)->delete("/console/activity-log/{$entry->id}")->assertRedirect();

    expect(ActivityLog::find($entry->id))->toBeNull()
        ->and(ActivityLog::onlyTrashed()->find($entry->id))->not->toBeNull();

    $this->actingAs($admin)->get('/console/activity-log')->assertInertia(fn ($page) => $page->where('logs', fn ($logs) => collect($logs)->doesntContain('id', $entry->id)));
});

it('deletes several journal entries at once', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $entries = collect([logEntry('a'), logEntry('b'), logEntry('c')]);
    $keep = logEntry('à garder');

    $this->actingAs($admin)->post('/console/activity-log/supprimer', ['ids' => $entries->pluck('id')->all()])->assertRedirect();

    expect(ActivityLog::onlyTrashed()->whereIn('id', $entries->pluck('id'))->count())->toBe(3)
        ->and(ActivityLog::find($keep->id))->not->toBeNull();
});

it('lists a deleted entry in the corbeille and lets it be restored or erased', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $entry = logEntry('Entrée à retrouver');
    $entry->delete();

    $this->actingAs($admin)->get('/console/corbeille')->assertInertia(fn ($page) => $page->where('items', fn ($items) => collect($items)->contains(fn ($item) => $item['type'] === 'journal' && $item['id'] === $entry->id)));

    $this->actingAs($admin)->post("/console/corbeille/journal/{$entry->id}/restaurer")->assertRedirect();
    expect(ActivityLog::find($entry->id))->not->toBeNull();

    $entry->delete();
    $this->actingAs($admin)->delete("/console/corbeille/journal/{$entry->id}")->assertRedirect();
    expect(ActivityLog::withTrashed()->find($entry->id))->toBeNull();
});

it('keeps journal deletion to users holding the delete permission', function () {
    $entry = logEntry();
    $scolarite = User::factory()->create();
    $scolarite->assignRole('scolarite');

    $this->actingAs($scolarite)->delete("/console/activity-log/{$entry->id}")->assertForbidden();
    $this->actingAs($scolarite)->post('/console/activity-log/supprimer', ['ids' => [$entry->id]])->assertForbidden();

    expect(ActivityLog::find($entry->id))->not->toBeNull();
});

it('rejects a bulk deletion without ids or with unknown ids', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/activity-log/supprimer', [])->assertSessionHasErrors('ids');
    $this->actingAs($admin)->post('/console/activity-log/supprimer', ['ids' => [999999]])->assertSessionHasErrors('ids.0');
});
