<?php

use App\Http\Controllers\FiliereController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('filieres', [FiliereController::class, 'index'])->name('filieres.index');
Route::get('filieres/{filiere:slug}', [FiliereController::class, 'show'])->name('filieres.show');

Route::get('enseignants', [TeacherController::class, 'index'])->name('enseignants.index');

require __DIR__.'/auth.php';
