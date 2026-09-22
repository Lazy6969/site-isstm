<?php

use App\Http\Controllers\Admin\QuickEditController;
use App\Http\Controllers\Admin\SiteContentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('console/contenu', [SiteContentController::class, 'index'])
        ->middleware('can:quick-edit.access')
        ->name('admin.content.index');

    Route::post('console/content/update', [QuickEditController::class, 'update'])
        ->name('admin.content.update');
});
