<?php

use App\Http\Controllers\Admin\MaterielController;
use Illuminate\Support\Facades\Route;

// The standalone space: /materiel, with its own chrome (MaterielLayout, no
// sidebar) — the matériel role only ever needs this one page (see RoleHome,
// which lands it here straight after login), the same idea as /communaute
// for étudiants.
Route::middleware(['auth'])->prefix('materiel')->name('materiel.')->group(function () {
    Route::get('/', [MaterielController::class, 'index'])->middleware('can:materiel.view')->name('index');
    Route::post('/', [MaterielController::class, 'store'])->middleware('can:materiel.create')->name('store');

    // Fixed-segment routes must be registered before the `{materiel}` wildcard
    // routes below, otherwise e.g. DELETE .../historique is captured by the
    // `{materiel}` route binding (treating "historique" as an id and 404ing).
    Route::post('deplacements/{deplacement}/retourner', [MaterielController::class, 'retourner'])->middleware('can:materiel.edit')->name('deplacements.retourner');
    Route::delete('deplacements/{deplacement}', [MaterielController::class, 'destroyDeplacement'])->middleware('can:materiel.delete')->name('deplacements.destroy');
    Route::delete('historique', [MaterielController::class, 'destroyAllHistorique'])->middleware('can:materiel.delete')->name('historique.destroy-all');

    Route::put('{materiel}', [MaterielController::class, 'update'])->middleware('can:materiel.edit')->name('update');
    Route::delete('{materiel}', [MaterielController::class, 'destroy'])->middleware('can:materiel.delete')->name('destroy');
    Route::post('{materiel}/maintenance', [MaterielController::class, 'storeMaintenance'])->middleware('can:materiel.edit')->name('maintenance.store');
    Route::post('{materiel}/emprunter', [MaterielController::class, 'emprunter'])->middleware('can:materiel.edit')->name('emprunter');
});

// Same page, reached from inside the admin console (sidebar "Matériel"
// category): rendered embedded in AdminLayout, sidebar and all, like every
// other console module — not a jump out to the standalone space above, which
// exists for the matériel role, not for an admin just browsing the console.
Route::middleware(['auth'])->prefix('console/materiel')->name('admin.materiel.')->group(function () {
    Route::get('/', [MaterielController::class, 'indexAdmin'])->middleware('can:materiel.view')->name('index');
});
