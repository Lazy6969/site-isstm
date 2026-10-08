<?php

use App\Http\Controllers\Admin\AppearanceSettingsController;
use App\Http\Controllers\Admin\MaintenanceSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/settings')->name('admin.settings.')->group(function () {
    Route::get('appearance', [AppearanceSettingsController::class, 'index'])->middleware('can:settings.manage')->name('appearance');
    Route::put('appearance', [AppearanceSettingsController::class, 'update'])->middleware('can:settings.manage')->name('appearance.update');

    Route::get('maintenance', [MaintenanceSettingsController::class, 'index'])->middleware('can:settings.manage')->name('maintenance');
    Route::put('maintenance', [MaintenanceSettingsController::class, 'update'])->middleware('can:settings.manage')->name('maintenance.update');
    Route::get('maintenance/preview', [MaintenanceSettingsController::class, 'preview'])->middleware('can:settings.manage')->name('maintenance.preview');
    // Préinscription/réactivation gating, formerly its own /console/settings/inscriptions page.
    Route::put('maintenance/inscriptions', [MaintenanceSettingsController::class, 'updateInscriptions'])->middleware('can:settings.manage')->name('maintenance.inscriptions.update');
});
