<?php

use App\Http\Controllers\Admin\CampusBlocController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/campus')->name('admin.campus.')->group(function () {
    Route::get('/', [CampusBlocController::class, 'index'])->middleware('can:campus.view')->name('index');
    Route::post('/', [CampusBlocController::class, 'store'])->middleware('can:campus.create')->name('store');
    Route::put('{bloc}', [CampusBlocController::class, 'update'])->middleware('can:campus.edit')->name('update');
    Route::delete('{bloc}', [CampusBlocController::class, 'destroy'])->middleware('can:campus.delete')->name('destroy');

    Route::post('{bloc}/photos', [CampusBlocController::class, 'storePhotos'])->middleware('can:campus.edit')->name('photos.store');
    Route::delete('{bloc}/photos/{index}', [CampusBlocController::class, 'destroyPhoto'])->middleware('can:campus.edit')->name('photos.destroy');
});
