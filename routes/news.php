<?php

use App\Http\Controllers\Admin\NewsArticleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/actualites')->name('admin.news.')->group(function () {
    Route::get('/', [NewsArticleController::class, 'index'])->middleware('can:news.view')->name('index');
    Route::post('/', [NewsArticleController::class, 'store'])->middleware('can:news.create')->name('store');
    Route::put('{article}', [NewsArticleController::class, 'update'])->middleware('can:news.edit')->name('update');
    Route::delete('{article}', [NewsArticleController::class, 'destroy'])->middleware('can:news.delete')->name('destroy');
});
