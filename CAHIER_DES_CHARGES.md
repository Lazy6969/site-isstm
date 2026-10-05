# Cahier des charges — Site institutionnel ISSTM Mahajanga

Document de référence technique et fonctionnel du site web de l'**Institut Supérieur des Sciences et Technologies de Mahajanga (ISSTM)**. Il couvre la technologie utilisée, l'architecture du code, le rôle de chaque dossier/fichier essentiel, la configuration matérielle et logicielle requise, et la méthode d'installation complète.

> Dernière mise à jour : document généré à partir de l'état du dépôt au moment de sa rédaction. Le code évoluant en continu, se référer au code source pour le détail exact d'une fonctionnalité précise.

---

## Table des matières

1. [Présentation générale](#1-présentation-générale)
2. [Technologies utilisées](#2-technologies-utilisées)
3. [Configuration matérielle et logicielle requise](#3-configuration-matérielle-et-logicielle-requise)
4. [Architecture générale du projet](#4-architecture-générale-du-projet)
5. [Backend — dossier `app/`](#5-backend--dossier-app)
6. [Base de données](#6-base-de-données)
7. [Rôles et permissions](#7-rôles-et-permissions)
8. [Routes](#8-routes)
9. [Frontend — dossier `resources/`](#9-frontend--dossier-resources)
10. [Tests automatisés](#10-tests-automatisés)
11. [Méthode d'installation](#11-méthode-dinstallation)
12. [Scripts et commandes utiles](#12-scripts-et-commandes-utiles)
13. [Déploiement](#13-déploiement)
14. [Modules fonctionnels — vue d'ensemble](#14-modules-fonctionnels--vue-densemble)

---

## 1. Présentation générale

Le site ISSTM est une application web institutionnelle complète qui couvre :

- Un **site vitrine public** (accueil, filières, actualités, événements, galerie, équipe, enseignants, campus, documents, recherche...).
- Un **parcours de préinscription et de réinscription en ligne** pour les candidats et étudiants (brouillon, soumission, suivi de dossier, validation par la scolarité).
- Un **espace communautaire social interne** réservé aux membres (admin, enseignants, étudiants) : fil d'actualité, messagerie privée, groupes de classe, amis, stories, notifications.
- Une **console d'administration** (`/console`) complète : gestion de tout le contenu du site, des utilisateurs, des rôles, de l'apparence, des statistiques, et de la scolarité.
- Un **système de contenu « modification rapide »** (quick edit) : les administrateurs autorisés peuvent modifier textes, images, icônes et styles directement sur les pages publiques, sans passer par la console.

Le site est **multilingue** (français, anglais, malgache) et fonctionne comme une **PWA** (Progressive Web App) installable.

---

## 2. Technologies utilisées

### 2.1 Backend

| Technologie | Version | Rôle |
|---|---|---|
| **PHP** | ^8.4 | Langage serveur |
| **Laravel** | ^13.17 | Framework backend (MVC, routing, ORM, queues, notifications...) |
| **Inertia.js (Laravel adapter)** | ^3.3 | Pont entre Laravel et React — pas d'API REST séparée, le backend retourne directement des « pages » Inertia |
| **Spatie Laravel Permission** | ^8.3 | Gestion des rôles et permissions (RBAC) |
| **Laravel Lang** | ^15.35 | Traductions des messages du framework (validation, auth...) |
| **Laravel Tinker** | ^3.0 | REPL interactif pour déboguer en ligne de commande |

**Outils de développement (`require-dev`)** :

| Outil | Rôle |
|---|---|
| **Pest** (^5.2) + **Pest Plugin Laravel** | Framework de tests (syntaxe `it(...)`) |
| **Laravel Pint** (^1.27) | Formatage automatique du code PHP (style PSR-12) |
| **Laravel Boost** (^2.2) | Serveur MCP d'assistance IA pour le développement (outils de requêtage DB, docs, etc.) |
| **Faker PHP** | Génération de données factices pour les factories/seeders |
| **Mockery**, **Collision**, **Pail**, **Pao** | Mocking, affichage d'erreurs amélioré, logs en temps réel, outils de profiling |

### 2.2 Frontend

| Technologie | Version | Rôle |
|---|---|---|
| **React** | ^19.3 | Bibliothèque UI |
| **Inertia.js (React adapter)** | ^3.7 | Rendu des pages Laravel côté React sans API REST |
| **Vite** | ^8.0 | Bundler / serveur de développement |
| **Tailwind CSS** | ^4.0 | Framework CSS utilitaire (configuration via `@theme` dans `resources/css/app.css`, pas de `tailwind.config.js` — Tailwind v4) |
| **Radix UI** (`@radix-ui/react-*`) | ^1.x/^2.x | Primitives UI accessibles non stylées (dialog, dropdown-menu, tabs, tooltip, avatar, navigation-menu, separator) — habillées par les composants `resources/js/Components/ui/*` |
| **Lucide React** | ^1.47 | Bibliothèque d'icônes SVG |
| **Recharts** | ^3.10 | Graphiques (tableaux de bord admin et étudiant) |
| **class-variance-authority**, **clsx**, **tailwind-merge** | Gestion des classes CSS conditionnelles/variantes de composants |
| **tw-animate-css** | Animations CSS utilitaires supplémentaires pour Tailwind |

### 2.3 Base de données et stockage

- **MySQL** en développement et production (`DB_CONNECTION=mysql`), base `isstm`. SQLite est supporté nativement pour les tests (suite de tests configurée pour tourner en mémoire).
- **Disque de fichiers public** (`storage/app/public`, lié à `public/storage` par un lien symbolique Laravel) pour tous les contenus uploadés : avatars, images de contenu, pièces jointes de messages, diapositives d'accueil (images/vidéos), documents de préinscription, galerie photo, etc.
- **Driver de cache et de files d'attente** : `database` (tables `cache`, `jobs`) — pas de Redis/Memcached requis en configuration par défaut.
- **Driver de session** : `database`.

### 2.4 Polices et ressources externes

- Police de base **Instrument Sans** auto-hébergée via le plugin de fonts de `laravel-vite-plugin` (téléchargée et servie localement au build, aucune requête réseau externe en production pour cette police).
- Polices additionnelles pour la mise en forme rapide des textes (Dancing Script, Lora, Playfair Display, Montserrat, Poppins, Oswald, Caveat, Bebas Neue, Roboto Mono, Raleway) chargées via Google Fonts (`<link>` dans `resources/views/app.blade.php`).

### 2.5 Environnement de développement local

- **Laravel Herd** (Windows/macOS) : sert le site via Nginx + PHP-CGI, gère les domaines `.test`, PHP multi-version, et un CLI (`herd`) pour la gestion du service (`herd restart`, `herd php:list`, etc.).
- Domaine local : `http://site_isstm.test`.

---

## 3. Configuration matérielle et logicielle requise

### 3.1 Poste de développement

| Ressource | Minimum | Recommandé |
|---|---|---|
| Processeur | Double cœur 2 GHz | Quad-cœur 2.5 GHz+ |
| RAM | 4 Go | 8 Go+ (Vite, Node, MySQL et PHP tournent simultanément) |
| Disque | 2 Go d'espace libre | SSD recommandé (le dossier `node_modules` et `vendor` sont volumineux) |
| OS | Windows 10/11, macOS, Linux | — |

**Logiciels requis :**

- **PHP 8.4** avec les extensions standard Laravel (`mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `gd` ou `imagick` pour le traitement d'images).
- **Composer 2.x** (gestionnaire de dépendances PHP).
- **Node.js 20+** et **npm** (le `package.json` utilise des syntaxes ES modules et des plugins Vite récents — Node 18 minimum strictement, 20+ conseillé).
- **MySQL 8.x** (ou MariaDB équivalent) — ou SQLite pour un environnement de test rapide.
- **Git**.
- Un environnement de service local type **Laravel Herd**, **Laravel Valet**, **XAMPP/WAMP**, ou tout serveur Nginx/Apache + PHP-FPM configuré pour pointer vers `public/`.

### 3.2 Serveur de production

| Ressource | Minimum | Recommandé |
|---|---|---|
| Processeur | 1 vCPU | 2 vCPU+ |
| RAM | 1 Go | 2 Go+ (plus si trafic communauté/messagerie important) |
| Disque | 10 Go | 20 Go+ (stockage des médias uploadés : avatars, galerie, vidéos d'accueil, pièces de dossiers) |
| Bande passante | Standard hébergement web | Selon trafic — le site sert des images/vidéos volumineuses (diapositives d'accueil jusqu'à 100 Mo) |

**Logiciels serveur requis :**

- PHP 8.4-FPM.
- Nginx ou Apache avec réécriture d'URL vers `public/index.php`.
- MySQL 8.x.
- Un worker de file d'attente actif en permanence (`php artisan queue:work`) pour les notifications par e-mail (réinitialisation de mot de passe, vérification d'e-mail, notifications de préinscription...) — ces notifications sont **mises en file** (`ShouldQueue`), elles ne partent pas sans un worker actif.
- Un accès SMTP (ou tout driver mail Laravel) configuré en production — en développement, le driver `log` écrit les e-mails dans les logs au lieu de les envoyer réellement.
- Certificat TLS/HTTPS (obligatoire en production pour les cookies de session sécurisés et la PWA).
- Recommandé : déploiement via **Laravel Cloud** (déjà pris en charge par le projet, skill `deploying-to-cloud` disponible), qui gère automatiquement compute, base de données, stockage objet et variables d'environnement.

---

## 4. Architecture générale du projet

Le projet suit la structure standard d'une application Laravel, avec Inertia.js comme pont vers React (donc **pas d'API REST séparée** ni de `routes/api.php` significatif — les contrôleurs retournent directement des pages Inertia ou des redirections).

```
site_isstm/
├── app/                      Backend PHP (contrôleurs, modèles, enums, middleware, notifications, services)
├── bootstrap/                Amorçage de l'application (app.php : déclaration des middlewares globaux)
├── config/                   Fichiers de configuration Laravel (app, database, mail, filesystems, inertia...)
├── database/
│   ├── migrations/           84 migrations — schéma complet de la base de données
│   ├── factories/            Factories Pest/Eloquent pour les tests et le seeding
│   └── seeders/               Peuplement initial (rôles/permissions, utilisateurs de démo, contenus de démo)
├── lang/                     Fichiers de traduction (fr/en/mg)
├── public/                   Racine web publique (index.php, build/ généré par Vite, images statiques, storage symlink)
├── resources/
│   ├── css/app.css           Point d'entrée CSS — thème Tailwind v4 (@theme), tokens de couleur, animations custom
│   ├── js/                   Application React (Pages, Components, lib)
│   └── views/                Vues Blade (app.blade.php = coquille HTML qui monte React, + pages Blade autonomes)
├── routes/                   Fichiers de routes, un par domaine fonctionnel (voir §8)
├── storage/                  Fichiers générés (logs, cache compilé, fichiers uploadés via le disque "public")
├── tests/                    Suite de tests Pest (Feature + Unit), 78 fichiers
├── public/.user.ini          Limites PHP (upload) portables pour un hébergement mutualisé/PHP-FPM standard
├── composer.json             Dépendances et scripts PHP
├── package.json              Dépendances et scripts JS
└── vite.config.js            Configuration du bundler (entrées CSS/JS, police auto-hébergée, plugins Tailwind/React)
```

---

## 5. Backend — dossier `app/`

### 5.1 Contrôleurs publics (`app/Http/Controllers/`)

| Fichier | Rôle |
|---|---|
| `HomeController.php` | Page d'accueil — diapositives, témoignages, filières vedettes, dernières actualités, partenaires |
| `FiliereController.php` | Liste et fiche détaillée d'une filière de formation |
| `TeacherController.php` | Annuaire des enseignants |
| `NewsController.php` | Liste et détail des actualités publiées |
| `EvenementController.php` | Liste des événements |
| `GalleryController.php` | Galerie photo publique (albums + photos) |
| `CampusController.php` | Présentation des blocs du campus |
| `DocumentController.php` | Documents téléchargeables (règlements, formulaires...) |
| `DirecteurController.php` | Page « Mot du directeur » |
| `HistoriqueController.php`, `ContactController.php`, `ParcoursController.php` | Pages institutionnelles statiques/semi-statiques |
| `SearchController.php` | Recherche globale sur le site (tokenisation du contenu) |
| `SitemapController.php` | Génération du `sitemap.xml` |
| `NewsletterController.php` | Inscription à la newsletter |
| `LocaleController.php` | Changement de langue (fr/en/mg) |
| `InscriptionController.php` | Page d'information sur l'inscription (vitrine) |
| `PreinscriptionController.php` | **Parcours candidat** : création de compte, assistant multi-étapes, enregistrement de brouillon, soumission finale, page de suivi `/mon-dossier` |
| `InscriptionDossierController.php` | **Parcours étudiant** : réinscription / redoublement en self-service (brouillon + soumission) |
| `ProfileController.php` | Modification du profil personnel (nom, photo, bio, réseaux sociaux...) et page de profil public |
| `DashboardController.php` | Tableau de bord personnel de l'espace communauté (statistiques d'activité, suivi de dossier, infos de compte) |
| `SettingsController.php` | Paramètres personnels (apparence, accent de couleur communauté) |

### 5.2 Espace communautaire (`app/Http/Controllers/`)

| Fichier | Rôle |
|---|---|
| `PostController.php`, `CommentController.php`, `ReactionController.php` | Fil d'actualité social : publications, commentaires, réactions |
| `PostSaveController.php`, `PostHideController.php`, `PostArchiveController.php`, `PostPinController.php`, `PostReportController.php`, `PostCommentsToggleController.php`, `PostReactionListController.php` | Actions secondaires sur une publication (enregistrer, masquer, archiver, épingler, signaler, désactiver les commentaires, liste des réactions) |
| `StoryController.php` | Stories éphémères (type « statut » 24h) |
| `FriendController.php` | Demandes d'amis, liste d'amis |
| `ConversationController.php`, `MessageController.php`, `MessageForwardController.php`, `MessageReactionController.php` | Messagerie privée 1-à-1 |
| `ClassGroupController.php`, `ClassGroupMemberController.php`, `ClassGroupMessageController.php`, `ClassGroupAnnouncementController.php`, `ClassGroupPresenceController.php` | Groupes de classe : membres, messages de groupe, annonces, feuilles de présence |
| `StaffMessageController.php` | Messagerie interne du personnel (« messagerie ») |
| `NotificationController.php` | Centre de notifications (lecture, suppression, badge non lus) |

### 5.3 Authentification (`app/Http/Controllers/Auth/`)

Basé sur le kit d'authentification standard Laravel (Breeze-like), avec vérification d'e-mail obligatoire :

| Fichier | Rôle |
|---|---|
| `AuthenticatedSessionController.php` | Connexion / déconnexion |
| `DepartmentAuthenticatedSessionController.php` | Connexion dédiée aux comptes « responsable matériel » / scolarité (sous-domaine) |
| `PasswordResetLinkController.php`, `NewPasswordController.php` | Mot de passe oublié / réinitialisation |
| `PasswordController.php` | Changement de mot de passe (utilisateur connecté) |
| `EmailVerificationPromptController.php`, `EmailVerificationNotificationController.php`, `VerifyEmailController.php` | Vérification d'adresse e-mail |

### 5.4 Console d'administration (`app/Http/Controllers/Admin/`)

Tous gardés par des permissions Spatie (`can:xxx` sur chaque route, voir §7) :

| Fichier | Domaine géré |
|---|---|
| `DashboardController.php` | Tableau de bord admin (statistiques globales, tendances) |
| `DepartmentDashboardController.php` | Tableau de bord du sous-domaine scolarité/matériel |
| `UserController.php` | Liste des utilisateurs, changement de rôle, activation/désactivation, **édition de profil (nom/email/téléphone/photo)** |
| `RoleController.php` | Gestion des rôles et de leurs permissions |
| `PreinscriptionController.php`, `InscriptionController.php` | Revue des dossiers de préinscription/réinscription (approbation, refus, demande de correction) |
| `EtudiantController.php`, `ClasseController.php` | Gestion des étudiants et des classes |
| `FiliereController.php` | CRUD des filières |
| `TeacherController.php` | CRUD des enseignants |
| `NewsArticleController.php` | CRUD + publication/rejet des actualités |
| `EvenementController.php` | CRUD + publication/rejet des événements |
| `GalleryAlbumController.php`, `GalleryPhotoController.php` | CRUD albums/photos + validation |
| `CampusBlocController.php` | CRUD des blocs du campus |
| `DocumentController.php` | CRUD des documents téléchargeables |
| `PartenaireController.php` | CRUD des partenaires |
| `TestimonialController.php` | CRUD des témoignages (page d'accueil) |
| `HeroSlideController.php` | CRUD des diapositives d'accueil (images/vidéos) |
| `OrgPersonController.php` | Organigramme de l'établissement |
| `ContactFieldVisibilityController.php`, `SectionVisibilityController.php` | Affichage conditionnel de champs/sections sur le site public |
| `AccessKeyController.php` | Clés d'accès (invitations/accès restreints) |
| `ActivityLogController.php` | Consultation du journal d'activité admin |
| `SiteContentController.php`, `SiteContentRevisionController.php` | Contenu « modification rapide » et historique des révisions |
| `QuickEditController.php` | Point d'entrée d'enregistrement des modifications rapides (texte/image/icône + style) |
| `AppearanceSettingsController.php` | Apparence du site (couleurs, police, densité) — admin et public |
| `MaintenanceSettingsController.php` | Mode maintenance (activation, gabarit, prévisualisation) |
| `StatisticsController.php` | Statistiques détaillées |
| `TrashController.php` | Corbeille générique (restauration de tout contenu supprimé, soft-delete) |
| `Concerns/ManagesUploadedImages.php` | Trait partagé : upload/suppression sécurisée des fichiers image/vidéo |

### 5.5 Middleware (`app/Http/Middleware/`)

| Fichier | Rôle |
|---|---|
| `HandleInertiaRequests.php` | Partage les données globales à **chaque** page Inertia (utilisateur connecté, permissions, contenu éditable, couleur du site, etc.) |
| `SetLocale.php` | Applique la langue choisie à chaque requête |
| `EnsureUserHasRole.php` | Vérifie qu'un utilisateur a l'un des rôles autorisés sur une route |
| `EnsureAccessKeyActive.php` | Vérifie la validité d'une clé d'accès |
| `EnsureIsMessagerieUser.php` | Restreint l'accès à la messagerie interne au personnel autorisé |
| `TouchLastActivity.php` | Met à jour le timestamp de dernière activité d'un utilisateur |
| `CheckMaintenanceMode.php` | Bloque l'accès au site (hors admin et routes essentielles) quand le mode maintenance est actif, affiche la page `maintenance.blade.php` |

### 5.6 Modèles Eloquent (`app/Models/`, 46 fichiers)

Principaux modèles et leurs relations clés :

| Modèle | Relations principales | Rôle |
|---|---|---|
| `User` | `hasOne Etudiant`, `hasMany Candidat`, `hasMany Post/Story/...`, rôles Spatie | Compte utilisateur unique pour tout le site (admin, enseignant, étudiant, candidat) |
| `Candidat` | `belongsTo User`, `belongsTo Filiere`, `hasOne Etudiant` | Dossier de préinscription d'un candidat (identité, pièces, statut) |
| `Etudiant` | `belongsTo User`, `belongsTo Candidat`, `belongsTo Classe`, `hasMany Inscription` | Étudiant admis — matricule, classe courante |
| `Inscription` | `belongsTo Etudiant`, `belongsTo Classe`, `belongsTo Filiere` | Dossier de réinscription/redoublement annuel (self-service ou saisie manuelle scolarité) |
| `Classe` | `hasMany Etudiant` | Classe/promotion |
| `Filiere` | `hasMany Candidat/Inscription` | Filière de formation |
| `Post`, `PostMedia`, `Comment`, `Reaction` | — | Publications du fil communauté et leurs médias/réactions/commentaires |
| `Story` | — | Story éphémère |
| `Conversation`, `Message`, `MessageAttachment`, `MessageReaction` | — | Messagerie privée |
| `ClassGroup`, `ClassGroupMember`, `ClassGroupMessage`, `ClassGroupMessageAttachment`, `ClassGroupAnnouncement`, `ClassGroupPresenceSession`, `ClassGroupPresenceMark` | — | Groupes de classe et présence |
| `FriendRequest` | — | Demandes/relations d'amitié |
| `NewsArticle`, `NewsCategory` | — | Actualités |
| `Evenement` | — | Événements |
| `GalleryAlbum`, `GalleryCategory`, `GalleryPhoto` | — | Galerie photo |
| `Document` | — | Documents téléchargeables |
| `Partenaire`, `Testimonial`, `OrgPerson`, `CampusBloc`, `HeroSlide` | — | Contenus de la page d'accueil et institutionnels |
| `SiteContent`, `SiteContentRevision` | — | Contenu éditable (quick edit) + historique de versions |
| `Setting` | — | Table clé/valeur générique (apparence, maintenance...) |
| `ActivityLog` | relation polymorphe via `subject_type`/`subject_id` | Journal de toutes les actions admin importantes |
| `SecurityLog` | — | Journal des événements de sécurité (connexions, etc.) |
| `AccessKey` | — | Clés d'accès/invitation |
| `StaffMessage`, `StaffMessageAttachment` | — | Messagerie interne du personnel |
| `NewsletterSubscriber` | — | Abonnés newsletter |
| `Teacher` | — | Fiche enseignant (annuaire public) |
| `PostReport` | — | Signalements de publications |

### 5.7 Enums (`app/*.php`, à la racine du namespace `App`)

Le projet utilise massivement les **enums PHP 8.1+ typés** (`string` backed) pour toute valeur à choix fermé, plutôt que des chaînes libres en base — chaque enum expose généralement une méthode `label()` (libellé français) et parfois `options()`/`colors()` pour l'UI :

`Role`, `PreinscriptionStatus`, `StatutInscription`, `StatutEtudiant`, `TypeInscription`, `PostType`, `PostVisibility`, `ReactionType`, `MediaType`, `FriendRequestStatus`, `GroupMemberRole`, `ClassGroupType`, `PresenceStatus`, `NewsStatus`, `EvenementStatus`, `GalleryStatus`, `SiteContentType`, `SiteIcon`, `HomeSection`, `ContactField`, `AnnouncementType`, `TeacherCategory`, `TeacherDepartement`, `CanevasNiveau`, `MemoireCategorie`, `MaintenanceTemplate`, `SitePrimaryColor`, `SiteAccentColor`, `SiteMenuColor`, `SiteFooterColor`, `AppearancePalette`, `AppearanceChromeColor`, `AppearanceFont`.

### 5.8 Notifications (`app/Notifications/`)

Toutes implémentent `ShouldQueue` (envoi asynchrone via la file d'attente) :

| Fichier | Déclenchée quand |
|---|---|
| `QueuedVerifyEmail`, `QueuedResetPassword` | Vérification d'e-mail / réinitialisation de mot de passe (remplace les notifications Laravel par défaut pour les passer en file) |
| `PreinscriptionSubmitted` | Un candidat soumet son dossier → notifie la scolarité |
| `PreinscriptionAccepted`, `PreinscriptionRefused`, `PreinscriptionCorrectionRequested` | La scolarité statue sur un dossier de préinscription |
| `InscriptionDossierSubmitted` | Un étudiant soumet une réinscription/redoublement |
| `InscriptionApproved`, `InscriptionRefused`, `InscriptionCorrectionRequested` | La scolarité statue sur une réinscription |
| `FriendRequestReceived`, `FriendRequestAccepted` | Événements du système d'amis |
| `NewMessageReceived` | Nouveau message privé |
| `NewPostPublished` | Nouvelle publication dans un groupe/fil suivi |
| `CommentReplied` | Réponse à un commentaire |

### 5.9 Services (`app/Services/`)

| Fichier | Rôle |
|---|---|
| `AzureTranslatorService.php` | Traduction automatique (Azure Translator) du contenu rédigé en français vers l'anglais et le malgache |
| `PostPresenter.php` | Met en forme une publication pour l'affichage (agrégation des réactions, médias, permissions d'action...) |
| `ConversationListBuilder.php` | Construit la liste des conversations (messagerie) avec dernier message, non-lus, etc. |

---

## 6. Base de données

- **84 migrations** dans `database/migrations/`, exécutées dans l'ordre chronologique de leur nom de fichier.
- Toutes les tables « contenu » sensibles au cycle de vie (publications, dossiers, albums, etc.) utilisent le **soft delete** Laravel (`deleted_at`), ce qui alimente la **Corbeille** générique de l'admin (`TrashController`).
- **Factories** (`database/factories/`) : une par modèle principal, utilisées par les tests et les seeders pour générer des données réalistes.
- **Seeders** (`database/seeders/`) :
  - `RolePermissionSeeder.php` — crée les rôles Spatie et leur assigne les permissions (voir §7).
  - `UserSeeder.php` — comptes de démonstration.
  - `HomeContentSeeder.php`, `NewsSeeder.php`, `GallerySeeder.php`, `TeacherSeeder.php`, `OrgPersonSeeder.php`, `PartenaireSeeder.php`, `CampusBlocSeeder.php` — contenu de démonstration/initial.
  - `DatabaseSeeder.php` — orchestre l'ensemble.

---

## 7. Rôles et permissions

Le contrôle d'accès repose sur **Spatie Laravel Permission** (rôles + permissions explicites), avec un enum `Role` PHP (`app/Role.php`) qui fait le pont avec un champ legacy `users.role` pour compatibilité.

**Rôles Spatie** : `super-admin`, `enseignant`, `etudiant`, `scolarite`, `responsable-materiel`.

**Permissions** (préfixées par domaine, assignées aux rôles dans `RolePermissionSeeder.php`) :

```
campus.*          classes.*         dashboard.view     documents.*
enseignants.*      etudiants.*       evenements.*       filieres.*
gallery.*          hero.*            inscriptions.*     news.*
organigramme.*      partenaires.*     preinscriptions.manage
roles.*             settings.manage   statistics.view     temoignages.*
users.*
```

(`*` = généralement `view`/`create`/`edit`/`delete`, et `publish` pour le contenu éditorial à validation)

---

## 8. Routes

Les routes sont **découpées par domaine fonctionnel**, chaque fichier étant `require`-d depuis `routes/web.php` :

| Fichier | Contenu |
|---|---|
| `web.php` | Point d'entrée — routes publiques du site vitrine + `require` de tous les autres fichiers |
| `auth.php` | Connexion, inscription, mot de passe |
| `admin.php` | Routes génériques de la console (`/console/...`) |
| `users.php`, `roles.php` | Gestion des comptes et des rôles |
| `settings.php` | Paramètres (apparence, maintenance) |
| `activity-log.php` | Journal d'activité |
| `access-keys.php` | Clés d'accès |
| `hero-slides.php` | Diapositives d'accueil |
| `news.php`, `evenements.php`, `galerie.php`, `partenaires.php`, `testimonials.php`, `teachers.php`, `filieres.php`, `documents.php`, `campus.php`, `organigramme.php` | CRUD admin + consultation publique de chaque domaine de contenu |
| `statistics.php` | Statistiques |
| `scolarite.php` | Sous-domaine scolarité (dossiers, classes, étudiants) |
| `subdomain-admin.php` | Authentification dédiée du sous-domaine admin/scolarité |
| `quick-edit.php` | Enregistrement des modifications rapides de contenu |
| `console.php` | Commandes Artisan planifiées (`schedule`) |

Aucune route `api.php` significative : toute communication frontend/backend passe par **Inertia.js** (requêtes XHR qui retournent du JSON de page, pas une API REST classique).

---

## 9. Frontend — dossier `resources/`

### 9.1 Point d'entrée

- `resources/js/app.jsx` : amorce l'application Inertia + React, enregistre les providers globaux (`QuickEditProvider`, `ToastProvider`, `LogoutConfirmProvider`) et les éléments flottants persistants sur chaque page (bouton Paramètres combiné crayon+profil, robot de défilement, sélecteur de couleur, SEO...).
- `resources/views/app.blade.php` : coquille HTML unique qui monte React (variables CSS de thème injectées côté serveur selon les réglages d'apparence, chargement des polices, balises PWA).
- `resources/views/maintenance.blade.php` : page Blade **autonome** (sans React) affichée quand le mode maintenance est actif — volontairement indépendante du build JS pour rester fonctionnelle même si celui-ci est cassé.

### 9.2 `resources/js/Pages/` — une page par route Inertia

Organisées par domaine (`Admin/`, `Communaute/`, `Messages/`, `Groupes/`, `Amis/`, `Notifications/`, `Preinscription/`, `Inscription/`, `Profile/`, `Dashboard/`, `Settings/`, `Auth/`, `Galerie/`, `Actualites/`, `Evenements/`, `Campus/`, `Documents/`, `Enseignants/`, `Equipe/`, `Filieres/`, `Formations/`, `Bibliotheque/`, `Department/`, `Contact/`, `Historique/`, `Directeur/`, `Search/`, `Messagerie/`). Le sous-dossier `Admin/` seul contient les pages de toute la console (reflétant les contrôleurs `Admin/*`).

### 9.3 `resources/js/Components/` — composants réutilisables

| Dossier | Contenu |
|---|---|
| `ui/` | Composants de base façon design-system (Button, Input, Dialog, Select, Table, Badge, Card, Avatar, Dropdown-menu...) — habillent les primitives Radix |
| `Layout/` | Éléments de mise en page globaux : en-tête, pied de page, barres de navigation mobile, boutons flottants, bascule thème clair/sombre, sélecteur de langue |
| `QuickEdit/` | Le système de **modification rapide** : `EditableText`, `EditableImage`, `EditableButton`, `EditableIcon`, leurs dialogues d'édition (`EditTextDialog`, `EditImageDialog`...), le sélecteur de couleur du site, le pencil "Couleur des étincelles", le toggle de mode édition, l'ajout rapide de contenu (actualité, document, galerie...) |
| `Home/` | Composants spécifiques à la page d'accueil (Hero, Stats, Filieres, Testimonials, Footer...) |
| `Communaute/` | Fil social : `PostCard`, `PostMediaLightbox`, `CommentItem`, `ComposePostModal`, stories... |
| `Messages/`, `Groupes/`, `Amis/` | Composants de la messagerie, des groupes de classe, du système d'amis |
| `Admin/` | Composants propres à la console (sidebar, en-tête admin, dialogues d'édition de profil utilisateur...) |
| `Auth/`, `Form/`, `Bibliotheque/`, `Contact/`, `Evenements/`, `Parcours/`, `Preinscription/`, `Loading/` | Composants spécifiques à chaque domaine |

### 9.4 `resources/js/lib/` — logique partagée côté client

Hooks et utilitaires : `useQuickEdit`, `useToast`, `useTranslations`, `useLogoutConfirm`, `useCloseOnDesktop`, `useIsNavigatingToHome`/`useIsNavigatingToCommunity`, `textStyle.js` (polices/soulignement de la mise en forme rapide), `imageStyle.js`, `buttonStyle.js`, `useAccentColor.js`, `utils.js` (fonction `cn()` de fusion de classes).

### 9.5 Styles (`resources/css/app.css`)

Point d'entrée CSS unique. Tailwind v4 est configuré **sans fichier `tailwind.config.js`** : tout passe par le bloc `@theme` directement dans ce fichier (couleurs de marque `--color-isstm-*`, polices `--font-*`, tokens d'admin `--color-admin-*`). Contient aussi les animations CSS personnalisées (défilement des logos partenaires, étincelles de l'accueil, barre de progression des stories) et les overrides spécifiques à l'espace communauté.

---

## 10. Tests automatisés

- **Framework** : Pest (syntaxe `it('fait quelque chose', function () { ... });`), avec le plugin Laravel pour les helpers `actingAs()`, `assertInertia()`, etc.
- **78 fichiers de tests**, principalement dans `tests/Feature/` (tests bout-en-bout HTTP) et quelques `tests/Unit/` pour la logique pure sans dépendance au framework (ex. `SitePrimaryColorTest.php`).
- Organisation : `tests/Feature/Admin/` (toute la console), `tests/Feature/Auth/` (authentification), et des fichiers à la racine de `tests/Feature/` pour chaque domaine public/communauté.
- **Commandes** :
  ```bash
  php artisan test --compact                       # suite complète
  php artisan test --compact tests/Feature/X.php    # un seul fichier
  php artisan test --compact --filter=nomDuTest     # un test précis
  ```
- La suite tourne sur une base **SQLite en mémoire** par défaut en test (voir `phpunit.xml`), indépendante de la base MySQL de développement — aucun risque d'altérer les données réelles en lançant les tests.

---

## 11. Méthode d'installation

### 11.1 Prérequis

Installer au préalable : PHP 8.4, Composer, Node.js 20+/npm, MySQL 8.x (ou utiliser SQLite), Git, et un serveur web local (Herd/Valet/XAMPP ou équivalent).

### 11.2 Installation automatique (recommandée)

Le projet fournit un script Composer tout-en-un :

```bash
composer run setup
```

Ce script exécute automatiquement, dans l'ordre :
1. `composer install` — installe les dépendances PHP.
2. Copie `.env.example` vers `.env` (si absent).
3. `php artisan key:generate` — génère la clé de chiffrement de l'application.
4. `php artisan migrate --force` — crée toutes les tables.
5. `npm install --ignore-scripts` — installe les dépendances JS.
6. `npm run build` — compile les assets frontend pour la production.

### 11.3 Installation manuelle, étape par étape

```bash
# 1. Cloner le dépôt
git clone <url-du-depot> site_isstm
cd site_isstm

# 2. Dépendances PHP
composer install

# 3. Fichier d'environnement
cp .env.example .env
php artisan key:generate

# 4. Configurer la base de données dans .env
#    DB_CONNECTION=mysql
#    DB_HOST=127.0.0.1
#    DB_PORT=3306
#    DB_DATABASE=isstm          (créer cette base au préalable : CREATE DATABASE isstm;)
#    DB_USERNAME=root
#    DB_PASSWORD=

# 5. Lancer les migrations (+ seeders pour des données de démo)
php artisan migrate
php artisan db:seed            # optionnel : rôles, permissions, comptes et contenu de démo

# 6. Lien symbolique du stockage public (obligatoire pour afficher les fichiers uploadés)
php artisan storage:link

# 7. Dépendances JS et build des assets
npm install
npm run build                  # production
# ou
npm run dev                    # mode développement (rechargement à chaud)

# 8. Lancer le serveur
php artisan serve              # serveur de dev intégré, http://127.0.0.1:8000
# — ou servir public/ via Herd/Nginx/Apache sur un domaine dédié
```

### 11.4 Variables d'environnement essentielles (`.env`)

| Variable | Rôle |
|---|---|
| `APP_NAME`, `APP_URL` | Nom et URL publique du site |
| `APP_ENV`, `APP_DEBUG` | `local`/`production`, désactiver `APP_DEBUG` en production |
| `DB_*` | Connexion MySQL |
| `MAIL_*` | Serveur SMTP pour l'envoi réel des e-mails (vérification, réinitialisation, notifications de dossier) — en développement, `MAIL_MAILER=log` écrit dans les logs sans réellement envoyer |
| `QUEUE_CONNECTION=database` | Nécessite un `php artisan queue:work` actif pour que les notifications soient réellement délivrées |
| `FILESYSTEM_DISK` | Disque de stockage par défaut (fichiers uploadés via le disque `public`) |

### 11.5 Lancer l'environnement de développement complet

Le script `composer run dev` lance en parallèle (via `concurrently`) :
- le serveur PHP (`php artisan serve`),
- le worker de file d'attente (`php artisan queue:listen`),
- le serveur Vite (`npm run dev`).

```bash
composer run dev
```

---

## 12. Scripts et commandes utiles

| Commande | Effet |
|---|---|
| `php artisan route:list` | Liste toutes les routes enregistrées |
| `php artisan migrate:fresh --seed` | Réinitialise complètement la base avec les données de démo |
| `vendor/bin/pint` | Formate automatiquement tout le code PHP selon le style du projet |
| `vendor/bin/pint --dirty` | Ne formate que les fichiers modifiés (non commités) |
| `php artisan test --compact` | Lance toute la suite de tests |
| `npm run build` | Compile les assets pour la production (`public/build/`) |
| `npm run dev` | Démarre Vite en mode développement avec rechargement à chaud |
| `php artisan tinker` | Console interactive PHP dans le contexte de l'application |
| `php artisan storage:link` | (Re)crée le lien symbolique `public/storage` → `storage/app/public` |

---

## 13. Déploiement

Le projet est prévu pour être déployé sur **Laravel Cloud**, qui prend en charge automatiquement le compute, la base de données managée, le stockage objet et les variables d'environnement. Pour tout autre hébergement (VPS, mutualisé compatible PHP-FPM) :

1. Fournir PHP 8.4-FPM, MySQL, un certificat TLS.
2. Déployer le code, exécuter `composer install --no-dev --optimize-autoloader` et `npm run build`.
3. Configurer `.env` en production (`APP_ENV=production`, `APP_DEBUG=false`, base de données réelle, SMTP réel).
4. Lancer les migrations : `php artisan migrate --force`.
5. Créer le lien de stockage : `php artisan storage:link`.
6. Mettre en cache la configuration/les routes pour la performance : `php artisan config:cache && php artisan route:cache && php artisan view:cache`.
7. Maintenir un worker de file d'attente actif en permanence (`php artisan queue:work`, idéalement supervisé par Supervisor/systemd) pour que les e-mails et notifications partent réellement.
8. Le fichier `public/.user.ini` fixe des limites d'upload (`upload_max_filesize`, `post_max_size` à 100 Mo/110 Mo) qui s'appliquent automatiquement sur un hébergement PHP-FPM standard sans configuration serveur supplémentaire.

---

## 14. Modules fonctionnels — vue d'ensemble

| Module | Description | Fichiers clés (backend → frontend) |
|---|---|---|
| **Vitrine publique** | Accueil, filières, actualités, événements, galerie, équipe, campus, documents | `HomeController` → `Pages/Home.jsx` + `Components/Home/*` |
| **Préinscription candidat** | Compte + assistant multi-étapes + brouillon + soumission + suivi `/mon-dossier` | `PreinscriptionController`, `Candidat` → `Pages/Preinscription/*` |
| **Réinscription/redoublement étudiant** | Parcours self-service pour un étudiant déjà admis | `InscriptionDossierController`, `Inscription` → `Pages/Inscription/*` |
| **Revue de dossiers (scolarité)** | Approbation, refus, demande de correction, affectation de classe | `Admin/PreinscriptionController`, `Admin/InscriptionController` → `Pages/Admin/Scolarite/*`, `Pages/Admin/Preinscriptions/*` |
| **Espace communauté** | Fil social, stories, amis, messagerie, groupes de classe, notifications | `PostController` et apparentés → `Pages/Communaute/*`, `Pages/Messages/*`, `Pages/Groupes/*`, `Pages/Amis/*` |
| **Console d'administration** | CRUD de tout le contenu, utilisateurs, rôles, apparence, statistiques, corbeille | `app/Http/Controllers/Admin/*` → `resources/js/Pages/Admin/*` |
| **Modification rapide (quick edit)** | Édition de texte/image/icône/style directement sur le site public par un admin autorisé | `QuickEditController`, `SiteContent` → `Components/QuickEdit/*` |
| **Apparence du site** | Couleurs (préréglages + sélecteur personnalisé), police, densité, couleur des étincelles d'accueil | `Admin/AppearanceSettingsController` → `Pages/Admin/Settings/Appearance.jsx` |
| **Mode maintenance** | Bascule + gabarits + prévisualisation en direct | `Admin/MaintenanceSettingsController`, `CheckMaintenanceMode` → `Pages/Admin/Settings/Maintenance.jsx`, `maintenance.blade.php` |
| **PWA** | Manifest + service worker (mise en cache réseau-first, assets content-hashés en cache-first) | `public/manifest.json`, `public/sw.js` |
| **Multilingue** | fr/en/mg, traduction automatique du contenu rédigé (Azure Translator) | `lang/`, `SetLocale`, `AzureTranslatorService` |

---

*Document à faire évoluer avec le projet : toute nouvelle fonctionnalité significative devrait idéalement mettre à jour la section correspondante.*
