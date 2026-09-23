<?php

use App\Http\Controllers\Admin\ActivityLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/activity-log')->name('admin.activity-log.')->group(function () {
    Route::get('/', [ActivityLogController::class, 'index'])->middleware('can:activity-log.view')->name('index');
});
