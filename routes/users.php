<?php

use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/users')->name('admin.users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->middleware('can:users.view')->name('index');
    Route::put('{user}/role', [UserController::class, 'updateRole'])->middleware('can:users.edit')->name('update-role');
    Route::post('{user}/toggle-active', [UserController::class, 'toggleActive'])->middleware('can:users.edit')->name('toggle-active');
});
