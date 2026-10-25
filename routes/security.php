<?php

use App\Http\Controllers\Admin\PasswordResetRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'can:security.manage'])->prefix('console/securite')->name('admin.securite.')->group(function () {
    Route::get('/', [PasswordResetRequestController::class, 'index'])->name('index');
    Route::post('{passwordResetRequest}/accepter', [PasswordResetRequestController::class, 'approve'])->name('approve');
    Route::post('{passwordResetRequest}/refuser', [PasswordResetRequestController::class, 'refuse'])->name('refuse');
});
