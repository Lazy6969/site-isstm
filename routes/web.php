<?php

use App\Http\Controllers\Admin\PreinscriptionController as AdminPreinscriptionController;
use App\Http\Controllers\CampusController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PreinscriptionController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('filieres', [FiliereController::class, 'index'])->name('filieres.index');
Route::get('filieres/{filiere:slug}', [FiliereController::class, 'show'])->name('filieres.show');

Route::get('enseignants', [TeacherController::class, 'index'])->name('enseignants.index');

Route::inertia('bourse', 'Bourse')->name('bourse');
Route::inertia('vie-etudiante', 'VieEtudiante')->name('vie-etudiante');
Route::inertia('associations', 'Associations')->name('associations');

Route::get('campus', [CampusController::class, 'index'])->name('campus.index');
Route::get('campus/{bloc:bloc_key}', [CampusController::class, 'show'])->name('campus.show');

Route::inertia('parcours', 'Parcours')->name('parcours');

Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');

Route::inertia('mentions-legales', 'MentionsLegales')->name('mentions-legales');
Route::inertia('confidentialite', 'Confidentialite')->name('confidentialite');

Route::get('sitemap.xml', SitemapController::class)->name('sitemap');

Route::get('actualites', [NewsController::class, 'index'])->name('actualites.index');
Route::get('actualites/{article:slug}', [NewsController::class, 'show'])->name('actualites.show');

Route::get('evenements', [EvenementController::class, 'index'])->name('evenements.index');

Route::get('galerie', [GalleryController::class, 'index'])->name('galerie.index');
Route::get('galerie/{album:slug}', [GalleryController::class, 'show'])->name('galerie.show');

Route::get('recherche', [SearchController::class, 'index'])->name('recherche');

Route::get('inscription', [InscriptionController::class, 'index'])->name('inscription');
Route::get('preinscription', [PreinscriptionController::class, 'create'])->name('preinscription.create');
Route::post('preinscription', [PreinscriptionController::class, 'store'])->name('preinscription.store');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('preinscriptions', [AdminPreinscriptionController::class, 'index'])->name('preinscriptions.index');
    Route::post('preinscriptions/{preinscription}/approve', [AdminPreinscriptionController::class, 'approve'])->name('preinscriptions.approve');
});

require __DIR__.'/auth.php';
