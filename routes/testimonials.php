<?php

use App\Http\Controllers\Admin\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/temoignages')->name('admin.temoignages.')->group(function () {
    Route::get('/', [TestimonialController::class, 'index'])->middleware('can:temoignages.view')->name('index');
    Route::post('/', [TestimonialController::class, 'store'])->middleware('can:temoignages.create')->name('store');
    Route::put('{temoignage}', [TestimonialController::class, 'update'])->middleware('can:temoignages.edit')->name('update');
    Route::delete('{temoignage}', [TestimonialController::class, 'destroy'])->middleware('can:temoignages.delete')->name('destroy');
});
