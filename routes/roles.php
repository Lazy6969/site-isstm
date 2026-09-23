<?php

use App\Http\Controllers\Admin\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/roles')->name('admin.roles.')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->middleware('can:roles.view')->name('index');
    Route::put('{role}', [RoleController::class, 'update'])->middleware('can:roles.edit')->name('update');
});
