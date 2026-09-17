<?php

use App\Http\Controllers\Bibliotheque\Admin\CanevasController as AdminCanevasController;
use App\Http\Controllers\Bibliotheque\Admin\DashboardController;
use App\Http\Controllers\Bibliotheque\Admin\MemoireController as AdminMemoireController;
use App\Http\Controllers\Bibliotheque\Admin\ReglagesController;
use App\Http\Controllers\Bibliotheque\BibliothequeController;
use App\Http\Controllers\Bibliotheque\BibliothequeSearchController;
use App\Http\Controllers\Bibliotheque\CanevasController;
use App\Http\Controllers\Bibliotheque\MemoireController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('bibliotheque')->name('bibliotheque.')->group(function () {
    Route::get('/', [BibliothequeController::class, 'index'])->name('index');
    Route::get('recherche', [BibliothequeSearchController::class, 'index'])->name('recherche');

    Route::get('canevas', [CanevasController::class, 'index'])->name('canevas.index');
    Route::get('canevas/{canevas}/telecharger', [CanevasController::class, 'download'])->name('canevas.telecharger');

    Route::get('memoires', [MemoireController::class, 'index'])->name('memoires.index');
    Route::get('memoires/{memoire}/consulter', [MemoireController::class, 'show'])->name('memoires.consulter');
    Route::get('memoires/{memoire}/flux', [MemoireController::class, 'stream'])->name('memoires.flux');

    Route::middleware('bibliotheque.admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('canevas', [AdminCanevasController::class, 'index'])->name('canevas.index');
        Route::post('canevas', [AdminCanevasController::class, 'store'])->name('canevas.store');
        Route::delete('canevas/{canevas}', [AdminCanevasController::class, 'destroy'])->name('canevas.destroy');

        Route::get('memoires', [AdminMemoireController::class, 'index'])->name('memoires.index');
        Route::post('memoires', [AdminMemoireController::class, 'store'])->name('memoires.store');
        Route::delete('memoires/{memoire}', [AdminMemoireController::class, 'destroy'])->name('memoires.destroy');

        Route::get('reglages', [ReglagesController::class, 'index'])->name('reglages.index');
        Route::post('reglages/mentions', [ReglagesController::class, 'storeMention'])->name('reglages.mentions.store');
        Route::delete('reglages/mentions/{mention}', [ReglagesController::class, 'destroyMention'])->name('reglages.mentions.destroy');
        Route::post('reglages/filieres', [ReglagesController::class, 'storeFiliere'])->name('reglages.filieres.store');
        Route::delete('reglages/filieres/{filiere}', [ReglagesController::class, 'destroyFiliere'])->name('reglages.filieres.destroy');
        Route::post('reglages/annees', [ReglagesController::class, 'storeAnnee'])->name('reglages.annees.store');
        Route::delete('reglages/annees/{annee}', [ReglagesController::class, 'destroyAnnee'])->name('reglages.annees.destroy');
    });
});
