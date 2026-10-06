<?php

use App\Http\Controllers\Admin\ActionArchiveController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'can:activity-log.view'])->prefix('console/archives')->name('admin.archives.')->group(function () {
    Route::get('/', [ActionArchiveController::class, 'index'])->name('index');
    Route::post('unlock', [ActionArchiveController::class, 'unlock'])->name('unlock');
    Route::post('lock', [ActionArchiveController::class, 'lock'])->name('lock');

    Route::middleware('archive.unlocked')->group(function () {
        Route::get('verify', [ActionArchiveController::class, 'verify'])->name('verify');
        Route::get('export', [ActionArchiveController::class, 'export'])->name('export');
        Route::post('password', [ActionArchiveController::class, 'changePassword'])->name('password');
        Route::post('visibility', [ActionArchiveController::class, 'visibility'])->name('visibility');
        Route::post('{archive}/note', [ActionArchiveController::class, 'note'])->name('note');
        Route::post('{archive}/restore', [ActionArchiveController::class, 'restore'])->name('restore');
    });
});
