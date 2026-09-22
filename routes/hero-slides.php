<?php

use App\Http\Controllers\Admin\HeroSlideController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/accueil')->name('admin.hero.')->group(function () {
    Route::get('/', [HeroSlideController::class, 'index'])->middleware('can:hero.view')->name('index');
    Route::post('/', [HeroSlideController::class, 'store'])->middleware('can:hero.create')->name('store');
    Route::put('{heroSlide}', [HeroSlideController::class, 'update'])->middleware('can:hero.edit')->name('update');
    Route::delete('{heroSlide}', [HeroSlideController::class, 'destroy'])->middleware('can:hero.delete')->name('destroy');
});
