<?php

use App\Http\Controllers\Admin\ActivityLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/activity-log')->name('admin.activity-log.')->group(function () {
    Route::get('/', [ActivityLogController::class, 'index'])->middleware('can:activity-log.view')->name('index');
    Route::post('supprimer', [ActivityLogController::class, 'destroyMany'])->middleware('can:activity-log.delete')->name('destroy-many');
    Route::delete('{log}', [ActivityLogController::class, 'destroy'])->middleware('can:activity-log.delete')->name('destroy');
});
