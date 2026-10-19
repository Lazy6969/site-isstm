<?php

use App\Http\Controllers\Admin\ArchiveDossierController;
use App\Http\Controllers\Admin\ClasseController;
use App\Http\Controllers\Admin\EtudiantController;
use App\Http\Controllers\Admin\ResultatAdmissionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/scolarite')->name('admin.scolarite.')->group(function () {
    Route::get('classes', [ClasseController::class, 'index'])->middleware('can:classes.view')->name('classes.index');
    Route::post('classes', [ClasseController::class, 'store'])->middleware('can:classes.create')->name('classes.store');
    Route::put('classes/{classe}', [ClasseController::class, 'update'])->middleware('can:classes.edit')->name('classes.update');
    Route::delete('classes/{classe}', [ClasseController::class, 'destroy'])->middleware('can:classes.delete')->name('classes.destroy');

    Route::get('etudiants', [EtudiantController::class, 'index'])->middleware('can:etudiants.view')->name('etudiants.index');
    Route::get('etudiants/export', [EtudiantController::class, 'export'])->middleware('can:etudiants.export')->name('etudiants.export');
    Route::post('etudiants/pause-tous', [EtudiantController::class, 'pauseAll'])->middleware('can:etudiants.pause')->name('etudiants.pause-all');
    Route::post('etudiants/reactiver-tous', [EtudiantController::class, 'reactivateAll'])->middleware('can:etudiants.pause')->name('etudiants.reactivate-all');
    Route::get('etudiants/{etudiant}', [EtudiantController::class, 'show'])->middleware('can:etudiants.view')->name('etudiants.show');
    Route::post('etudiants', [EtudiantController::class, 'store'])->middleware('can:etudiants.create')->name('etudiants.store');
    Route::put('etudiants/{etudiant}', [EtudiantController::class, 'update'])->middleware('can:etudiants.edit')->name('etudiants.update');
    Route::post('etudiants/{etudiant}/pause', [EtudiantController::class, 'togglePause'])->middleware('can:etudiants.pause')->name('etudiants.toggle-pause');
    Route::delete('etudiants/{etudiant}', [EtudiantController::class, 'destroy'])->middleware('can:etudiants.delete')->name('etudiants.destroy');

    Route::get('resultats', [ResultatAdmissionController::class, 'index'])->middleware('can:resultats.view')->name('resultats.index');
    Route::get('resultats/modele', [ResultatAdmissionController::class, 'template'])->middleware('can:resultats.import')->name('resultats.template');
    Route::post('resultats/import', [ResultatAdmissionController::class, 'import'])->middleware('can:resultats.import')->name('resultats.import');
    Route::delete('resultats', [ResultatAdmissionController::class, 'destroyAll'])->middleware('can:resultats.delete')->name('resultats.destroy-all');
    Route::post('resultats', [ResultatAdmissionController::class, 'store'])->middleware('can:resultats.create')->name('resultats.store');
    Route::put('resultats/{resultat}', [ResultatAdmissionController::class, 'update'])->middleware('can:resultats.edit')->name('resultats.update');
    Route::delete('resultats/{resultat}', [ResultatAdmissionController::class, 'destroy'])->middleware('can:resultats.delete')->name('resultats.destroy');

    Route::get('resultats/archives', [ArchiveDossierController::class, 'index'])->middleware('can:resultats.view')->name('resultats.archives.index');
    Route::post('resultats/archives', [ArchiveDossierController::class, 'store'])->middleware('can:resultats.edit')->name('resultats.archives.store');
    Route::put('resultats/archives/{dossier}', [ArchiveDossierController::class, 'update'])->middleware('can:resultats.edit')->name('resultats.archives.update');
    Route::delete('resultats/archives/{dossier}', [ArchiveDossierController::class, 'destroy'])->middleware('can:resultats.delete')->name('resultats.archives.destroy');
    Route::post('resultats/archives/{dossier}/restaurer', [ArchiveDossierController::class, 'restore'])->middleware('can:resultats.edit')->name('resultats.archives.restore');
    Route::get('resultats/archives/{dossier}/export/excel', [ArchiveDossierController::class, 'exportExcel'])->middleware('can:resultats.export')->name('resultats.archives.export-excel');
    Route::get('resultats/archives/{dossier}/export/pdf', [ArchiveDossierController::class, 'exportPdf'])->middleware('can:resultats.export')->name('resultats.archives.export-pdf');
});
