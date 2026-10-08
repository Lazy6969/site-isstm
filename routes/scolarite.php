<?php

use App\Http\Controllers\Admin\ClasseController;
use App\Http\Controllers\Admin\EtudiantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/scolarite')->name('admin.scolarite.')->group(function () {
    Route::get('classes', [ClasseController::class, 'index'])->middleware('can:classes.view')->name('classes.index');
    Route::post('classes', [ClasseController::class, 'store'])->middleware('can:classes.create')->name('classes.store');
    Route::put('classes/{classe}', [ClasseController::class, 'update'])->middleware('can:classes.edit')->name('classes.update');
    Route::delete('classes/{classe}', [ClasseController::class, 'destroy'])->middleware('can:classes.delete')->name('classes.destroy');

    Route::get('etudiants', [EtudiantController::class, 'index'])->middleware('can:etudiants.view')->name('etudiants.index');
    Route::get('etudiants/export', [EtudiantController::class, 'export'])->middleware('can:etudiants.view')->name('etudiants.export');
    Route::post('etudiants/pause-tous', [EtudiantController::class, 'pauseAll'])->middleware('can:etudiants.edit')->name('etudiants.pause-all');
    Route::get('etudiants/{etudiant}', [EtudiantController::class, 'show'])->middleware('can:etudiants.view')->name('etudiants.show');
    Route::post('etudiants', [EtudiantController::class, 'store'])->middleware('can:etudiants.create')->name('etudiants.store');
    Route::put('etudiants/{etudiant}', [EtudiantController::class, 'update'])->middleware('can:etudiants.edit')->name('etudiants.update');
    Route::post('etudiants/{etudiant}/pause', [EtudiantController::class, 'togglePause'])->middleware('can:etudiants.edit')->name('etudiants.toggle-pause');
    Route::delete('etudiants/{etudiant}', [EtudiantController::class, 'destroy'])->middleware('can:etudiants.delete')->name('etudiants.destroy');
});
