<?php

use App\Http\Controllers\Admin\TeacherController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/enseignants')->name('admin.enseignants.')->group(function () {
    Route::get('/', [TeacherController::class, 'index'])->middleware('can:enseignants.view')->name('index');
    Route::post('/', [TeacherController::class, 'store'])->middleware('can:enseignants.create')->name('store');
    Route::put('{teacher}', [TeacherController::class, 'update'])->middleware('can:enseignants.edit')->name('update');
    Route::delete('{teacher}', [TeacherController::class, 'destroy'])->middleware('can:enseignants.delete')->name('destroy');
});
