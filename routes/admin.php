<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PreinscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->prefix('console')->name('admin.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('preinscriptions', [PreinscriptionController::class, 'index'])->name('preinscriptions.index');
    Route::post('preinscriptions/{preinscription}/approve', [PreinscriptionController::class, 'approve'])->name('preinscriptions.approve');
});
