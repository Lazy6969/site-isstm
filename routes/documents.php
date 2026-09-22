<?php

use App\Http\Controllers\Admin\DocumentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/documents')->name('admin.documents.')->group(function () {
    Route::get('/', [DocumentController::class, 'index'])->middleware('can:documents.view')->name('index');
    Route::post('/', [DocumentController::class, 'store'])->middleware('can:documents.create')->name('store');
    Route::put('{document}', [DocumentController::class, 'update'])->middleware('can:documents.edit')->name('update');
    Route::delete('{document}', [DocumentController::class, 'destroy'])->middleware('can:documents.delete')->name('destroy');
});
