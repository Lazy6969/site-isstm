<?php

use App\Http\Controllers\Admin\StatisticsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/statistiques')->name('admin.statistics.')->group(function () {
    Route::get('/', [StatisticsController::class, 'index'])->middleware('can:statistics.view')->name('index');
});
