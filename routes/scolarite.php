<?php

use App\Http\Controllers\Admin\ClasseController;
use App\Http\Controllers\Admin\EtudiantController;
use App\Http\Controllers\Admin\InscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/scolarite')->name('admin.scolarite.')->group(function () {
    Route::get('classes', [ClasseController::class, 'index'])->middleware('can:classes.view')->name('classes.index');
    Route::post('classes', [ClasseController::class, 'store'])->middleware('can:classes.create')->name('classes.store');
    Route::put('classes/{classe}', [ClasseController::class, 'update'])->middleware('can:classes.edit')->name('classes.update');
    Route::delete('classes/{classe}', [ClasseController::class, 'destroy'])->middleware('can:classes.delete')->name('classes.destroy');

    Route::get('etudiants', [EtudiantController::class, 'index'])->middleware('can:etudiants.view')->name('etudiants.index');
    Route::get('etudiants/{etudiant}', [EtudiantController::class, 'show'])->middleware('can:etudiants.view')->name('etudiants.show');
    Route::post('etudiants', [EtudiantController::class, 'store'])->middleware('can:etudiants.create')->name('etudiants.store');
    Route::put('etudiants/{etudiant}', [EtudiantController::class, 'update'])->middleware('can:etudiants.edit')->name('etudiants.update');
    Route::delete('etudiants/{etudiant}', [EtudiantController::class, 'destroy'])->middleware('can:etudiants.delete')->name('etudiants.destroy');

    Route::get('inscriptions', [InscriptionController::class, 'index'])->middleware('can:inscriptions.view')->name('inscriptions.index');
    Route::post('inscriptions', [InscriptionController::class, 'store'])->middleware('can:inscriptions.create')->name('inscriptions.store');
    Route::put('inscriptions/{inscription}', [InscriptionController::class, 'update'])->middleware('can:inscriptions.edit')->name('inscriptions.update');
    Route::delete('inscriptions/{inscription}', [InscriptionController::class, 'destroy'])->middleware('can:inscriptions.delete')->name('inscriptions.destroy');
});
