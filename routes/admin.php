<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PreinscriptionController;
use App\Http\Controllers\Admin\ReactivationRequestController;
use App\Http\Controllers\Admin\TrashController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console')->name('admin.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->middleware('can:dashboard.view')->name('dashboard');

    Route::get('preinscriptions', [PreinscriptionController::class, 'index'])->middleware('can:preinscriptions.manage')->name('preinscriptions.index');
    Route::get('preinscriptions/export', [PreinscriptionController::class, 'export'])->middleware('can:preinscriptions.manage')->name('preinscriptions.export');
    Route::get('preinscriptions/{preinscription}', [PreinscriptionController::class, 'show'])->middleware('can:preinscriptions.manage')->name('preinscriptions.show');
    Route::post('preinscriptions/{preinscription}/approve', [PreinscriptionController::class, 'approve'])->middleware('can:preinscriptions.manage')->name('preinscriptions.approve');
    Route::post('preinscriptions/{preinscription}/refuse', [PreinscriptionController::class, 'refuse'])->middleware('can:preinscriptions.manage')->name('preinscriptions.refuse');
    Route::post('preinscriptions/{preinscription}/demander-correction', [PreinscriptionController::class, 'requestCorrection'])->middleware('can:preinscriptions.manage')->name('preinscriptions.request-correction');

    Route::get('reactivations', [ReactivationRequestController::class, 'index'])->middleware('can:reactivations.manage')->name('reactivations.index');
    Route::post('reactivations/{reactivation}/approuver', [ReactivationRequestController::class, 'approve'])->middleware('can:reactivations.manage')->name('reactivations.approve');
    Route::post('reactivations/{reactivation}/refuser', [ReactivationRequestController::class, 'refuse'])->middleware('can:reactivations.manage')->name('reactivations.refuse');
    Route::delete('reactivations/{reactivation}', [ReactivationRequestController::class, 'destroy'])->middleware('can:reactivations.manage')->name('reactivations.destroy');

    Route::middleware('can:dashboard.view')->prefix('corbeille')->name('trash.')->group(function () {
        Route::get('/', [TrashController::class, 'index'])->name('index');
        Route::post('{type}/{id}/restaurer', [TrashController::class, 'restore'])->name('restore');
        Route::delete('{type}/{id}', [TrashController::class, 'forceDelete'])->name('force-delete');
    });
});
