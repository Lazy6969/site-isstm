<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Point d'entrée du rôle « matériel » (redirection après connexion). Le contenu
// de la gestion du matériel est fourni ailleurs ; seule la route est conservée.
Route::middleware(['auth', 'can:materiel.view'])->prefix('materiel')->name('materiel.')->group(function () {
    Route::get('/', fn () => Inertia::render('Materiel/Dashboard'))->name('dashboard');
});
