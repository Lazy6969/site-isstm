<?php

use App\Http\Controllers\Admin\FiliereController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/filieres')->name('admin.filieres.')->group(function () {
    Route::get('/', [FiliereController::class, 'index'])->middleware('can:filieres.view')->name('index');
    Route::post('/', [FiliereController::class, 'store'])->middleware('can:filieres.create')->name('store');
    Route::put('{filiere}', [FiliereController::class, 'update'])->middleware('can:filieres.edit')->name('update');
    Route::delete('{filiere}', [FiliereController::class, 'destroy'])->middleware('can:filieres.delete')->name('destroy');
});
