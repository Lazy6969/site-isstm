<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:login');

    Route::get('mot-de-passe-oublie', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('mot-de-passe-oublie', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:password-reset')
        ->name('password.email');
});

// Not gated behind `guest`: a préinscription candidate is auto-logged-in the moment
// they submit the form, so their session is already authenticated by the time this
// e-mailed link reaches them. Under `guest`, RedirectIfAuthenticated would bounce
// them straight to `home` before they ever saw the new-password form.
Route::get('reinitialiser-mot-de-passe/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
Route::post('reinitialiser-mot-de-passe', [NewPasswordController::class, 'store'])->name('password.store');

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('profil', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profil', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('verifier-email', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('verifier-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('verifier-email', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});

Route::get('profil/{user}', [ProfileController::class, 'show'])->name('profile.show');
