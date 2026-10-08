<?php

use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\InscriptionDocumentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/documents')->name('admin.documents.')->group(function () {
    Route::get('/', [DocumentController::class, 'index'])->middleware('can:documents.view')->name('index');
    Route::post('/', [DocumentController::class, 'store'])->middleware('can:documents.create')->name('store');
    Route::put('{document}', [DocumentController::class, 'update'])->middleware('can:documents.edit')->name('update');
    Route::delete('{document}', [DocumentController::class, 'destroy'])->middleware('can:documents.delete')->name('destroy');
});

// The Inscription page's single downloadable "dossier de préinscription"
// slot — a fixed Document row (slug dossier_preinscription), edited inline
// from the public page's own pencil rather than the generic document
// library above (see DocumentSlotUploadDialog / Inscription/Index.jsx).
Route::post('console/inscription/dossier-preinscription', [InscriptionDocumentController::class, 'upload'])
    ->middleware(['auth', 'can:documents.edit'])
    ->name('admin.inscription.dossier-preinscription');
