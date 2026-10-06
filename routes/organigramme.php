<?php

use App\Http\Controllers\Admin\OrgDocumentController;
use App\Http\Controllers\Admin\OrgPersonController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/organigramme')->name('admin.organigramme.')->group(function () {
    Route::get('/', [OrgPersonController::class, 'index'])->middleware('can:organigramme.view')->name('index');
    Route::put('{orgPerson}', [OrgPersonController::class, 'update'])->middleware('can:organigramme.edit')->name('update');
    Route::post('documents/{slug}', [OrgDocumentController::class, 'upload'])->middleware('can:organigramme.edit')->name('documents.upload');
});
