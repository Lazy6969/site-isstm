<?php

use App\Http\Controllers\Admin\EcolagePaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/ecolage')->name('admin.ecolage.')->group(function () {
    Route::get('/', [EcolagePaymentController::class, 'index'])->middleware('can:payments.view')->name('index');
    Route::get('export', [EcolagePaymentController::class, 'export'])->middleware('can:payments.export')->name('export');
    Route::get('{payment}/fichier/{type}', [EcolagePaymentController::class, 'file'])->middleware('can:payments.view')->name('file');
    Route::post('{payment}/valider', [EcolagePaymentController::class, 'approve'])->middleware('can:payments.validate')->name('approve');
    Route::post('{payment}/refuser', [EcolagePaymentController::class, 'refuse'])->middleware('can:payments.refuse')->name('refuse');
    Route::delete('{payment}', [EcolagePaymentController::class, 'destroy'])->middleware('can:payments.delete')->name('destroy');
});
