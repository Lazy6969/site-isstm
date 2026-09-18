<?php

use App\Http\Controllers\Admin\PreinscriptionController as AdminPreinscriptionController;
use App\Http\Controllers\CampusController;
use App\Http\Controllers\ClassGroupAnnouncementController;
use App\Http\Controllers\ClassGroupController;
use App\Http\Controllers\ClassGroupMemberController;
use App\Http\Controllers\ClassGroupMessageController;
use App\Http\Controllers\ClassGroupPresenceController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HistoriqueController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PreinscriptionController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\StaffMessageController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('historique', [HistoriqueController::class, 'index'])->name('historique');
Route::get('contact', [ContactController::class, 'index'])->name('contact');
Route::post('locale/{locale}', [LocaleController::class, 'update'])->name('locale.update');

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

Route::middleware(['auth', 'role:admin,enseignant,etudiant'])->group(function () {
    Route::get('amis', [FriendController::class, 'index'])->name('friends.index');
    Route::post('amis/{recipient}', [FriendController::class, 'store'])->name('friends.store');
    Route::post('amis/demandes/{friendRequest}/accepter', [FriendController::class, 'accept'])->name('friends.accept');
    Route::post('amis/demandes/{friendRequest}/refuser', [FriendController::class, 'decline'])->name('friends.decline');
    Route::delete('amis/demandes/{friendRequest}', [FriendController::class, 'destroy'])->name('friends.destroy');

    Route::get('messages', [ConversationController::class, 'index'])->name('messages.index');
    Route::get('messages/{conversation}', [ConversationController::class, 'show'])->name('messages.show');
    Route::post('messages/nouveau/{friend}', [ConversationController::class, 'store'])->name('messages.start');
    Route::post('messages/{conversation}/envoyer', [MessageController::class, 'store'])->name('messages.send');
    Route::delete('messages/message/{message}', [MessageController::class, 'destroy'])->name('messages.messages.destroy');

    Route::get('communaute', [PostController::class, 'index'])->name('posts.index');
    Route::post('communaute', [PostController::class, 'store'])->name('posts.store');
    Route::delete('communaute/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('communaute/{post}/commentaires', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('commentaires/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('communaute/{post}/reaction', [ReactionController::class, 'store'])->name('reactions.store');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/recentes', [NotificationController::class, 'recent'])->name('notifications.recent');
    Route::post('notifications/tout-lire', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('notifications/{notification}/lu', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::get('groupes', [ClassGroupController::class, 'index'])->name('class-groups.index');
    Route::post('groupes', [ClassGroupController::class, 'store'])->name('class-groups.store');
    Route::post('groupes/rejoindre', [ClassGroupController::class, 'join'])->name('class-groups.join');
    Route::get('groupes/{group}', [ClassGroupController::class, 'show'])->name('class-groups.show');
    Route::post('groupes/{group}/messages', [ClassGroupMessageController::class, 'store'])->name('class-groups.messages.store');
    Route::delete('groupes/messages/{message}', [ClassGroupMessageController::class, 'destroy'])->name('class-groups.messages.destroy');
    Route::post('groupes/{group}/annonces', [ClassGroupAnnouncementController::class, 'store'])->name('class-groups.announcements.store');
    Route::delete('groupes/annonces/{announcement}', [ClassGroupAnnouncementController::class, 'destroy'])->name('class-groups.announcements.destroy');
    Route::get('groupes/{group}/presence', [ClassGroupPresenceController::class, 'index'])->name('class-groups.presence.index');
    Route::post('groupes/{group}/presence', [ClassGroupPresenceController::class, 'store'])->name('class-groups.presence.store');
    Route::post('groupes/membres/{member}/bannir', [ClassGroupMemberController::class, 'ban'])->name('class-groups.members.ban');
    Route::post('groupes/membres/{member}/reintegrer', [ClassGroupMemberController::class, 'unban'])->name('class-groups.members.unban');
    Route::post('groupes/membres/{member}/delegue', [ClassGroupMemberController::class, 'toggleDelegate'])->name('class-groups.members.delegate');
});

Route::middleware(['auth', 'messagerie'])->prefix('messagerie')->name('staff-messages.')->group(function () {
    Route::get('/', [StaffMessageController::class, 'index'])->name('index');
    Route::get('sondage', [StaffMessageController::class, 'poll'])->name('poll');
    Route::get('recherche', [StaffMessageController::class, 'search'])->name('search');
    Route::post('/', [StaffMessageController::class, 'store'])->name('store');
    Route::post('supprimer', [StaffMessageController::class, 'destroyConversation'])->name('destroy-conversation');
    Route::delete('{message}', [StaffMessageController::class, 'destroy'])->name('destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/bibliotheque.php';
