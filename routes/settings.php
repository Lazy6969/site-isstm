<?php

use App\Http\Controllers\Admin\AppearanceSettingsController;
use App\Http\Controllers\Admin\MaintenanceSettingsController;
use App\Http\Controllers\Admin\SystemDataController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/settings')->name('admin.settings.')->group(function () {
    Route::get('appearance', [AppearanceSettingsController::class, 'index'])->middleware('can:settings.manage')->name('appearance');
    Route::put('appearance', [AppearanceSettingsController::class, 'update'])->middleware('can:settings.manage')->name('appearance.update');

    Route::get('maintenance', [MaintenanceSettingsController::class, 'index'])->middleware('can:settings.manage')->name('maintenance');
    Route::put('maintenance', [MaintenanceSettingsController::class, 'update'])->middleware('can:settings.manage')->name('maintenance.update');
    Route::get('maintenance/preview', [MaintenanceSettingsController::class, 'preview'])->middleware('can:settings.manage')->name('maintenance.preview');
    // Préinscription/réactivation gating, formerly its own /console/settings/inscriptions page.
    Route::put('maintenance/inscriptions', [MaintenanceSettingsController::class, 'updateInscriptions'])->middleware('can:settings.manage')->name('maintenance.inscriptions.update');
    // The homepage "Admissions ouvertes/fermées" banner's on/off switch — also
    // reachable from the banner's own on-page toggle (same permission either way).
    Route::put('maintenance/admissions', [MaintenanceSettingsController::class, 'updateAdmissions'])->middleware('can:settings.manage')->name('maintenance.admissions.update');

    // "Maintenance des données" — export complet, suppression de toutes les
    // données et mise à jour du code. Bien plus dangereux que le reste de
    // Maintenance, donc sa propre permission (Super Admin uniquement par défaut).
    Route::get('maintenance/data/export', [SystemDataController::class, 'export'])->middleware('can:systemdata.export')->name('maintenance.data.export');
    Route::delete('maintenance/data/wipe', [SystemDataController::class, 'wipe'])->middleware('can:systemdata.wipe')->name('maintenance.data.wipe');
    Route::post('maintenance/data/update', [SystemDataController::class, 'update'])->middleware('can:systemdata.update')->name('maintenance.data.update');
});
