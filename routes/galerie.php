<?php

use App\Http\Controllers\Admin\GalleryAlbumController;
use App\Http\Controllers\Admin\GalleryPhotoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/galerie')->name('admin.galerie.')->group(function () {
    Route::get('/', [GalleryAlbumController::class, 'index'])->middleware('can:gallery.view')->name('index');
    Route::post('/', [GalleryAlbumController::class, 'store'])->middleware('can:gallery.create')->name('store');
    Route::put('{album}', [GalleryAlbumController::class, 'update'])->middleware('can:gallery.edit')->name('update');
    Route::delete('{album}', [GalleryAlbumController::class, 'destroy'])->middleware('can:gallery.delete')->name('destroy');

    Route::post('{album}/photos', [GalleryPhotoController::class, 'store'])->middleware('can:gallery.edit')->name('photos.store');
    Route::delete('photos/{photo}', [GalleryPhotoController::class, 'destroy'])->middleware('can:gallery.edit')->name('photos.destroy');

    Route::post('{album}/approve', [GalleryAlbumController::class, 'approve'])->middleware('can:gallery.publish')->name('approve');
    Route::post('{album}/reject', [GalleryAlbumController::class, 'reject'])->middleware('can:gallery.publish')->name('reject');
});
