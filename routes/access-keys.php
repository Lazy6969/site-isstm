<?php

use App\Http\Controllers\Admin\AccessKeyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/cles-acces')->name('admin.access-keys.')->group(function () {
    Route::get('/', [AccessKeyController::class, 'index'])->middleware('can:access-keys.manage')->name('index');
    Route::post('{department}/generate', [AccessKeyController::class, 'generate'])->middleware('can:access-keys.manage')->name('generate');
    Route::post('{department}/toggle', [AccessKeyController::class, 'toggle'])->middleware('can:access-keys.manage')->name('toggle');
});
