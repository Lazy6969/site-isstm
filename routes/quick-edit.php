<?php

use App\Http\Controllers\Admin\QuickEditController;
use App\Http\Controllers\Admin\SiteContentController;
use App\Http\Controllers\Admin\SiteContentRevisionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('console/contenu', [SiteContentController::class, 'index'])
        ->middleware('can:quick-edit.access')
        ->name('admin.content.index');

    Route::post('console/content/update', [QuickEditController::class, 'update'])
        ->name('admin.content.update');

    Route::get('console/contenu/historique', [SiteContentRevisionController::class, 'index'])
        ->middleware('can:quick-edit.access')
        ->name('admin.content.history');

    Route::post('console/content/{revision}/restore', [SiteContentRevisionController::class, 'restore'])
        ->name('admin.content.restore');
});
