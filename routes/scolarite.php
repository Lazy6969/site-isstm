<?php

use App\Http\Controllers\Admin\ClasseController;
use App\Http\Controllers\Admin\EtudiantController;
use App\Http\Controllers\Admin\InscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->prefix('console/scolarite')->name('admin.scolarite.')->group(function () {
    Route::get('classes', [ClasseController::class, 'index'])->name('classes.index');
    Route::post('classes', [ClasseController::class, 'store'])->name('classes.store');
    Route::put('classes/{classe}', [ClasseController::class, 'update'])->name('classes.update');
    Route::delete('classes/{classe}', [ClasseController::class, 'destroy'])->name('classes.destroy');

    Route::get('etudiants', [EtudiantController::class, 'index'])->name('etudiants.index');
    Route::get('etudiants/{etudiant}', [EtudiantController::class, 'show'])->name('etudiants.show');
    Route::post('etudiants', [EtudiantController::class, 'store'])->name('etudiants.store');
    Route::put('etudiants/{etudiant}', [EtudiantController::class, 'update'])->name('etudiants.update');

    Route::get('inscriptions', [InscriptionController::class, 'index'])->name('inscriptions.index');
    Route::post('inscriptions', [InscriptionController::class, 'store'])->name('inscriptions.store');
    Route::put('inscriptions/{inscription}', [InscriptionController::class, 'update'])->name('inscriptions.update');
    Route::delete('inscriptions/{inscription}', [InscriptionController::class, 'destroy'])->name('inscriptions.destroy');
});
