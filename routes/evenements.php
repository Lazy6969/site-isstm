<?php

use App\Http\Controllers\Admin\EvenementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/evenements')->name('admin.evenements.')->group(function () {
    Route::get('/', [EvenementController::class, 'index'])->middleware('can:evenements.view')->name('index');
    Route::post('/', [EvenementController::class, 'store'])->middleware('can:evenements.create')->name('store');
    Route::put('{evenement}', [EvenementController::class, 'update'])->middleware('can:evenements.edit')->name('update');
    Route::delete('{evenement}', [EvenementController::class, 'destroy'])->middleware('can:evenements.delete')->name('destroy');
});
