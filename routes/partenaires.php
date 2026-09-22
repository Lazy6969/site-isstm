<?php

use App\Http\Controllers\Admin\PartenaireController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/partenaires')->name('admin.partenaires.')->group(function () {
    Route::get('/', [PartenaireController::class, 'index'])->middleware('can:partenaires.view')->name('index');
    Route::post('/', [PartenaireController::class, 'store'])->middleware('can:partenaires.create')->name('store');
    Route::put('{partenaire}', [PartenaireController::class, 'update'])->middleware('can:partenaires.edit')->name('update');
    Route::delete('{partenaire}', [PartenaireController::class, 'destroy'])->middleware('can:partenaires.delete')->name('destroy');
});
