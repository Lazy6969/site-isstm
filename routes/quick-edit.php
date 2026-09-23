<?php

use App\Http\Controllers\Admin\ContactFieldVisibilityController;
use App\Http\Controllers\Admin\QuickEditController;
use App\Http\Controllers\Admin\SectionVisibilityController;
use App\Http\Controllers\Admin\SiteContentController;
use App\Http\Controllers\Admin\SiteContentRevisionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('console/contenu', [SiteContentController::class, 'index'])
        ->middleware('can:quick-edit.access')
        ->name('admin.content.index');

    Route::post('console/content/update', [QuickEditController::class, 'update'])
        ->name('admin.content.update');

    Route::post('console/sections/toggle', [SectionVisibilityController::class, 'toggle'])
        ->middleware('can:quick-edit.layout')
        ->name('admin.sections.toggle');

    Route::post('console/contact-fields/toggle', [ContactFieldVisibilityController::class, 'toggle'])
        ->middleware('can:quick-edit.layout')
        ->name('admin.contact-fields.toggle');

    Route::get('console/contenu/historique', [SiteContentRevisionController::class, 'index'])
        ->middleware('can:quick-edit.access')
        ->name('admin.content.history');

    Route::post('console/content/{revision}/restore', [SiteContentRevisionController::class, 'restore'])
        ->name('admin.content.restore');
});
