<?php

use App\Http\Controllers\Admin\TeacherController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/enseignants')->name('admin.teachers.')->group(function () {
    Route::get('/', [TeacherController::class, 'index'])->middleware('can:teachers.view')->name('index');
    Route::post('/', [TeacherController::class, 'store'])->middleware('can:teachers.create')->name('store');
    Route::put('{teacher}', [TeacherController::class, 'update'])->middleware('can:teachers.edit')->name('update');
    Route::delete('{teacher}', [TeacherController::class, 'destroy'])->middleware('can:teachers.delete')->name('destroy');
});
