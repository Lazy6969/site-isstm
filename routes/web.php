<?php

use App\Http\Controllers\AssistantController;
use App\Http\Controllers\CampusController;
use App\Http\Controllers\ClassGroupAnnouncementController;
use App\Http\Controllers\ClassGroupController;
use App\Http\Controllers\ClassGroupMemberController;
use App\Http\Controllers\ClassGroupMessageController;
use App\Http\Controllers\ClassGroupPresenceController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommunitySearchController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DirecteurController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentDownloadController;
use App\Http\Controllers\DocumentInteractionController;
use App\Http\Controllers\DossierTrackingController;
use App\Http\Controllers\EcolageController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HistoriqueController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\InscriptionDossierController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\MessageForwardController;
use App\Http\Controllers\MessageReactionController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ParcoursController;
use App\Http\Controllers\PostArchiveController;
use App\Http\Controllers\PostCommentsToggleController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostHideController;
use App\Http\Controllers\PostPinController;
use App\Http\Controllers\PostReactionListController;
use App\Http\Controllers\PostReportController;
use App\Http\Controllers\PostSaveController;
use App\Http\Controllers\PreinscriptionController;
use App\Http\Controllers\QuickContactController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\ReactivationRequestController;
use App\Http\Controllers\ResultatController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\StaffMessageController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('historique', [HistoriqueController::class, 'index'])->name('historique');
Route::get('contact', [ContactController::class, 'index'])->name('contact');
Route::post('contact/message-rapide', [QuickContactController::class, 'store'])->middleware('throttle:10,1')->name('contact.quick-message');
Route::get('mot-du-directeur', [DirecteurController::class, 'index'])->name('directeur');
Route::post('locale/{locale}', [LocaleController::class, 'update'])->name('locale.update');
Route::post('newsletter', [NewsletterController::class, 'store'])->name('newsletter.store');

Route::get('filieres', [FiliereController::class, 'index'])->name('filieres.index');
Route::get('filieres/{filiere:slug}', [FiliereController::class, 'show'])->name('filieres.show');

Route::get('enseignants', [TeacherController::class, 'index'])->name('enseignants.index');

Route::get('resultats', [ResultatController::class, 'index'])->name('resultats.index');

Route::inertia('bourse', 'Bourse')->name('bourse');
Route::inertia('faq', 'Faq')->name('faq');
Route::inertia('vie-etudiante', 'VieEtudiante')->name('vie-etudiante');
Route::inertia('associations', 'Associations')->name('associations');
Route::inertia('formations', 'Formations/Index')->name('formations');
Route::inertia('bibliotheque', 'Bibliotheque/Accueil')->name('bibliotheque');

Route::get('campus', [CampusController::class, 'index'])->name('campus.index');
Route::get('campus/{bloc:bloc_key}', [CampusController::class, 'show'])->name('campus.show');

Route::get('parcours', [ParcoursController::class, 'index'])->name('parcours');

Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
Route::get('telecharger', DocumentDownloadController::class)->middleware('throttle:60,1')->name('documents.download');
Route::get('consulter', [DocumentInteractionController::class, 'view'])->middleware('throttle:60,1')->name('documents.view');
Route::post('documents/partage', [DocumentInteractionController::class, 'share'])->middleware('throttle:30,1')->name('documents.share');

Route::inertia('mentions-legales', 'MentionsLegales')->name('mentions-legales');
Route::inertia('confidentialite', 'Confidentialite')->name('confidentialite');
Route::inertia('equipe', 'Equipe/Index')->name('equipe');

Route::get('sitemap.xml', SitemapController::class)->name('sitemap');

Route::get('actualites', [NewsController::class, 'index'])->name('actualites.index');
Route::get('actualites/{article:slug}', [NewsController::class, 'show'])->name('actualites.show');

Route::get('evenements', [EvenementController::class, 'index'])->name('evenements.index');

Route::get('galerie', [GalleryController::class, 'index'])->name('galerie.index');
Route::get('galerie/{album:slug}', [GalleryController::class, 'show'])->name('galerie.show');

Route::get('recherche', [SearchController::class, 'index'])->name('recherche');
// /communaute/recherche (publications et comptes uniquement) vit avec le
// reste des routes de la communauté plus bas, dans le groupe auth+role.

Route::post('assistant/demander', [AssistantController::class, 'ask'])->middleware('throttle:30,1')->name('assistant.ask');

Route::get('inscription', [InscriptionController::class, 'index'])->name('inscription');
Route::inertia('rejoindre', 'Rejoindre')->name('rejoindre');
Route::inertia('aide-inscription', 'Aide/Inscription')->name('aide.inscription');
Route::get('ancien-etudiant', [ReactivationRequestController::class, 'create'])->name('reactivation.create');
Route::post('ancien-etudiant', [ReactivationRequestController::class, 'store'])->middleware('throttle:10,1')->name('reactivation.store');
Route::get('suivi-dossier', [DossierTrackingController::class, 'show'])->middleware('throttle:30,1')->name('dossier.suivi');
Route::get('preinscription', [PreinscriptionController::class, 'create'])->name('preinscription.create');
Route::post('preinscription/compte', [PreinscriptionController::class, 'storeAccount'])->middleware('throttle:10,1')->name('preinscription.store-account');
Route::patch('preinscription/{preinscription}/brouillon', [PreinscriptionController::class, 'saveDraft'])->middleware(['auth', 'throttle:20,1'])->name('preinscription.save-draft');
Route::post('preinscription/{preinscription}/soumettre', [PreinscriptionController::class, 'submit'])->middleware(['auth', 'throttle:10,1'])->name('preinscription.submit');
// No longer 'verified': no verification e-mail goes out at submission time
// anymore (see PreinscriptionController::submit()) — the candidate reaches
// here straight from their own already-logged-in session.
Route::get('mon-dossier', [PreinscriptionController::class, 'dossier'])->middleware(['auth'])->name('preinscription.dossier');

Route::get('reinscription', [InscriptionDossierController::class, 'create'])->middleware(['auth', 'role:etudiant', 'access:reinscription.submit', 'verified'])->name('inscription-dossier.create');
Route::patch('reinscription/{inscription}/brouillon', [InscriptionDossierController::class, 'saveDraft'])->middleware(['auth', 'role:etudiant', 'access:reinscription.submit', 'verified', 'throttle:20,1'])->name('inscription-dossier.save-draft');
Route::post('reinscription/{inscription}/soumettre', [InscriptionDossierController::class, 'submit'])->middleware(['auth', 'role:etudiant', 'access:reinscription.submit', 'verified', 'throttle:10,1'])->name('inscription-dossier.submit');

// Notifications belong to the account, whatever its role: the scolarité and
// matériel staff get them too (they have the bell in the console), so these
// routes only ask for a signed-in user — not one of the community roles below.
Route::middleware(['auth', 'activity'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/recentes', [NotificationController::class, 'recent'])->name('notifications.recent');
    Route::post('notifications/tout-lire', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('notifications/supprimer', [NotificationController::class, 'destroySelected'])->name('notifications.destroy-selected');
    Route::post('notifications/tout-supprimer', [NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');
    Route::post('notifications/{notification}/lu', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

Route::middleware(['auth', 'role:admin,enseignant,etudiant', 'activity'])->group(function () {
    Route::get('amis', [FriendController::class, 'index'])->middleware('access:friends.manage')->name('friends.index');
    Route::post('amis/{recipient}', [FriendController::class, 'store'])->middleware('access:friends.manage')->name('friends.store');
    Route::post('amis/demandes/{friendRequest}/accepter', [FriendController::class, 'accept'])->middleware('access:friends.manage')->name('friends.accept');
    Route::post('amis/demandes/{friendRequest}/refuser', [FriendController::class, 'decline'])->middleware('access:friends.manage')->name('friends.decline');
    Route::delete('amis/demandes/{friendRequest}', [FriendController::class, 'destroy'])->middleware('access:friends.manage')->name('friends.destroy');

    Route::get('messages', [ConversationController::class, 'index'])->middleware('access:messages.view')->name('messages.index');
    Route::get('messages/{conversation}', [ConversationController::class, 'show'])->middleware('access:messages.view')->name('messages.show');
    Route::get('messages/groupe/{group}', [ConversationController::class, 'showGroup'])->middleware('access:messages.view')->name('messages.show-group');
    Route::post('messages/nouveau/{friend}', [ConversationController::class, 'store'])->middleware('access:messages.send')->name('messages.start');
    Route::post('messages/{conversation}/envoyer', [MessageController::class, 'store'])->middleware('access:messages.send')->name('messages.send');
    Route::patch('messages/message/{message}', [MessageController::class, 'update'])->middleware('access:messages.send')->name('messages.messages.update');
    Route::delete('messages/message/{message}', [MessageController::class, 'destroy'])->middleware('access:messages.send')->name('messages.messages.destroy');
    Route::post('messages/message/{message}/supprimer', [MessageController::class, 'unsend'])->middleware('access:messages.send')->name('messages.messages.unsend');
    Route::post('messages/message/{message}/transferer', [MessageForwardController::class, 'store'])->middleware('access:messages.send')->name('messages.messages.forward');
    Route::post('messages/message/{message}/reaction', [MessageReactionController::class, 'store'])->middleware('access:messages.send')->name('messages.messages.reaction');
    Route::get('messages/{conversation}/statut', [ConversationController::class, 'status'])->middleware('access:messages.view')->name('messages.status');
    Route::post('messages/{conversation}/frappe', [ConversationController::class, 'typing'])->middleware('access:messages.send')->name('messages.typing');

    Route::get('communaute', [PostController::class, 'index'])->middleware('access:community.view')->name('posts.index');
    Route::post('communaute', [PostController::class, 'store'])->middleware('access:community.post')->name('posts.store');
    Route::get('communaute/enregistres', [PostController::class, 'saved'])->middleware('access:community.view')->name('posts.saved');
    Route::get('communaute/archives', [PostController::class, 'archives'])->middleware('access:community.view')->name('posts.archives');
    Route::get('communaute/reels', [PostController::class, 'reels'])->middleware('access:community.view')->name('posts.reels');
    Route::get('communaute/souvenirs', [PostController::class, 'memories'])->middleware('access:community.view')->name('posts.memories');
    Route::get('communaute/recherche', [CommunitySearchController::class, 'index'])->middleware('access:community.view')->name('community-search');
    Route::get('communaute/{post}', [PostController::class, 'show'])->middleware('access:community.view')->name('posts.show');
    Route::patch('communaute/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('communaute/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('communaute/{post}/commentaires', [CommentController::class, 'store'])->middleware('access:community.comment')->name('comments.store');
    Route::post('communaute/{post}/enregistrer', [PostSaveController::class, 'toggle'])->name('posts.save');
    Route::post('communaute/{post}/masquer', [PostHideController::class, 'store'])->name('posts.hide');
    Route::post('communaute/{post}/signaler', [PostReportController::class, 'store'])->name('posts.report');
    Route::post('communaute/{post}/archiver', [PostArchiveController::class, 'toggle'])->name('posts.archive');
    Route::post('communaute/{post}/epingler', [PostPinController::class, 'toggle'])->name('posts.pin');
    Route::post('communaute/{post}/commentaires-toggle', [PostCommentsToggleController::class, 'toggle'])->name('posts.comments-toggle');
    Route::get('communaute/{post}/reactions', [PostReactionListController::class, 'index'])->middleware('access:community.view')->name('posts.reactions');

    Route::get('stories', [StoryController::class, 'index'])->middleware('access:stories.view')->name('stories.index');
    Route::post('stories', [StoryController::class, 'store'])->middleware('access:stories.create')->name('stories.store');
    Route::post('stories/{story}/vue', [StoryController::class, 'view'])->middleware('access:stories.view')->name('stories.view');
    Route::delete('stories/{story}', [StoryController::class, 'destroy'])->name('stories.destroy');

    Route::get('parametres', [SettingsController::class, 'index'])->name('settings.index');
    Route::get('tableau-de-bord', [DashboardController::class, 'index'])->name('dashboard.index');
    Route::patch('commentaires/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('commentaires/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('communaute/{post}/reaction', [ReactionController::class, 'store'])->middleware('access:community.react')->name('reactions.store');

    Route::get('groupes', [ClassGroupController::class, 'index'])->middleware('access:groups.view')->name('class-groups.index');
    Route::post('groupes', [ClassGroupController::class, 'store'])->middleware('access:groups.create')->name('class-groups.store');
    Route::post('groupes/rejoindre', [ClassGroupController::class, 'join'])->middleware('access:groups.join')->name('class-groups.join');
    Route::get('groupes/archives', [ClassGroupController::class, 'archives'])->middleware('access:groups.view')->name('class-groups.archives');
    Route::get('groupes/{group}', [ClassGroupController::class, 'show'])->middleware('access:groups.view')->name('class-groups.show');
    Route::delete('groupes/{group}', [ClassGroupController::class, 'destroy'])->middleware('access:groups.moderate')->name('class-groups.destroy');
    Route::post('groupes/{group}/archiver', [ClassGroupController::class, 'archive'])->middleware('access:groups.moderate')->name('class-groups.archive');
    Route::post('groupes/{group}/membres', [ClassGroupController::class, 'addMembers'])->middleware('access:groups.moderate')->name('class-groups.members.add');
    Route::post('groupes/{group}/messages', [ClassGroupMessageController::class, 'store'])->middleware('access:groups.message')->name('class-groups.messages.store');
    Route::delete('groupes/messages/{message}', [ClassGroupMessageController::class, 'destroy'])->name('class-groups.messages.destroy');
    Route::post('groupes/{group}/annonces', [ClassGroupAnnouncementController::class, 'store'])->middleware('access:groups.announce')->name('class-groups.announcements.store');
    Route::delete('groupes/annonces/{announcement}', [ClassGroupAnnouncementController::class, 'destroy'])->name('class-groups.announcements.destroy');
    Route::get('groupes/{group}/presence', [ClassGroupPresenceController::class, 'index'])->middleware('access:groups.presence')->name('class-groups.presence.index');
    Route::post('groupes/{group}/presence', [ClassGroupPresenceController::class, 'store'])->middleware('access:groups.presence')->name('class-groups.presence.store');
    Route::post('groupes/membres/{member}/bannir', [ClassGroupMemberController::class, 'ban'])->middleware('access:groups.moderate')->name('class-groups.members.ban');
    Route::post('groupes/membres/{member}/reintegrer', [ClassGroupMemberController::class, 'unban'])->middleware('access:groups.moderate')->name('class-groups.members.unban');
    Route::post('groupes/membres/{member}/delegue', [ClassGroupMemberController::class, 'toggleDelegate'])->middleware('access:groups.moderate')->name('class-groups.members.delegate');

    Route::get('ecolage', [EcolageController::class, 'index'])->middleware('access:ecolage.view')->name('ecolage.index');
    Route::post('ecolage', [EcolageController::class, 'store'])->middleware(['access:ecolage.submit', 'throttle:10,1'])->name('ecolage.store');
    Route::delete('ecolage/{payment}', [EcolageController::class, 'destroy'])->middleware('access:ecolage.submit')->name('ecolage.destroy');
    Route::get('ecolage/{payment}/fichier/{type}', [EcolageController::class, 'file'])->middleware('access:ecolage.view')->name('ecolage.file');
});

Route::middleware(['auth', 'messagerie'])->prefix('messagerie')->name('staff-messages.')->group(function () {
    Route::get('/', [StaffMessageController::class, 'index'])->name('index');
    Route::get('sondage', [StaffMessageController::class, 'poll'])->name('poll');
    Route::get('recherche', [StaffMessageController::class, 'search'])->name('search');
    Route::post('/', [StaffMessageController::class, 'store'])->name('store');
    Route::post('supprimer', [StaffMessageController::class, 'destroyConversation'])->name('destroy-conversation');
    Route::delete('{message}', [StaffMessageController::class, 'destroy'])->name('destroy');
});

require __DIR__.'/admin.php';
require __DIR__.'/scolarite.php';
require __DIR__.'/quick-edit.php';
require __DIR__.'/news.php';
require __DIR__.'/galerie.php';
require __DIR__.'/filieres.php';
require __DIR__.'/teachers.php';
require __DIR__.'/testimonials.php';
require __DIR__.'/partenaires.php';
require __DIR__.'/organigramme.php';
require __DIR__.'/evenements.php';
require __DIR__.'/campus.php';
require __DIR__.'/documents.php';
require __DIR__.'/ecolage.php';
require __DIR__.'/users.php';
require __DIR__.'/roles.php';
require __DIR__.'/activity-log.php';
require __DIR__.'/archives.php';
require __DIR__.'/settings.php';
require __DIR__.'/statistics.php';
require __DIR__.'/hero-slides.php';
require __DIR__.'/auth.php';
