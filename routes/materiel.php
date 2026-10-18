<?php

use App\Http\Controllers\Materiel\DashboardController;
use App\Http\Controllers\Materiel\EmpruntController;
use App\Http\Controllers\Materiel\HistoriqueController;
use App\Http\Controllers\Materiel\InterventionController;
use App\Http\Controllers\Materiel\MaterielActionController;
use App\Http\Controllers\Materiel\MaterielController;
use Illuminate\Support\Facades\Route;

// The matériel workspace: its own interface (MaterielLayout), separate from the admin console.
Route::middleware(['auth', 'can:materiel.view'])->prefix('materiel')->name('materiel.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('inventaire', [MaterielController::class, 'index'])->name('inventaire.index');
    Route::get('inventaire/export', [MaterielController::class, 'export'])->middleware('can:materiel.export')->name('inventaire.export');
    Route::post('inventaire', [MaterielController::class, 'store'])->middleware('can:materiel.create')->name('inventaire.store');
    Route::get('inventaire/{materiel}', [MaterielController::class, 'show'])->name('inventaire.show');
    Route::post('inventaire/{materiel}/modifier', [MaterielController::class, 'update'])->middleware('can:materiel.edit')->name('inventaire.update');
    Route::delete('inventaire/{materiel}', [MaterielController::class, 'destroy'])->middleware('can:materiel.delete')->name('inventaire.destroy');

    Route::post('inventaire/{materiel}/deplacer', [MaterielActionController::class, 'deplacer'])->middleware('can:materiel.move')->name('inventaire.deplacer');
    Route::post('inventaire/{materiel}/preter', [MaterielActionController::class, 'preter'])->middleware('can:materiel.loan')->name('inventaire.preter');
    Route::post('inventaire/{materiel}/panne', [MaterielActionController::class, 'panne'])->middleware('can:materiel.maintain')->name('inventaire.panne');
    Route::post('inventaire/{materiel}/maintenance', [MaterielActionController::class, 'maintenance'])->middleware('can:materiel.maintain')->name('inventaire.maintenance');
    Route::post('inventaire/{materiel}/reformer', [MaterielActionController::class, 'reformer'])->middleware('can:materiel.edit')->name('inventaire.reformer');

    Route::get('emprunts', [EmpruntController::class, 'index'])->name('emprunts.index');
    Route::post('emprunts/{emprunt}/retour', [EmpruntController::class, 'retour'])->middleware('can:materiel.loan')->name('emprunts.retour');
    Route::post('emprunts/{emprunt}/prolonger', [EmpruntController::class, 'prolonger'])->middleware('can:materiel.loan')->name('emprunts.prolonger');

    Route::get('interventions', [InterventionController::class, 'index'])->name('interventions.index');
    Route::post('interventions/{intervention}/terminer', [MaterielActionController::class, 'terminer'])->middleware('can:materiel.maintain')->name('interventions.terminer');

    Route::get('historique', [HistoriqueController::class, 'index'])->name('historique.index');
});
