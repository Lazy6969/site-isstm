<?php

use App\Http\Controllers\Admin\NewsArticleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/actualites')->name('admin.news.')->group(function () {
    Route::get('/', [NewsArticleController::class, 'index'])->middleware('can:news.view')->name('index');
    Route::post('/', [NewsArticleController::class, 'store'])->middleware('can:news.create')->name('store');
    Route::put('categories/colors', [NewsArticleController::class, 'updateCategoryColors'])->middleware('can:news.edit')->name('categories.colors');
    Route::put('{article}', [NewsArticleController::class, 'update'])->middleware('can:news.edit')->name('update');
    Route::delete('{article}', [NewsArticleController::class, 'destroy'])->middleware('can:news.delete')->name('destroy');

    Route::post('{article}/approve', [NewsArticleController::class, 'approve'])->middleware('can:news.publish')->name('approve');
    Route::post('{article}/reject', [NewsArticleController::class, 'reject'])->middleware('can:news.publish')->name('reject');
});
