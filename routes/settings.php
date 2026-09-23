<?php

use App\Http\Controllers\Admin\AppearanceSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/settings')->name('admin.settings.')->group(function () {
    Route::get('appearance', [AppearanceSettingsController::class, 'index'])->middleware('can:settings.manage')->name('appearance');
    Route::put('appearance', [AppearanceSettingsController::class, 'update'])->middleware('can:settings.manage')->name('appearance.update');
});
