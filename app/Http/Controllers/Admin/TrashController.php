<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ArchiveDossier;
use App\Models\CampusBloc;
use App\Models\Classe;
use App\Models\Document;
use App\Models\EcolagePayment;
use App\Models\Evenement;
use App\Models\Filiere;
use App\Models\GalleryAlbum;
use App\Models\GalleryPhoto;
use App\Models\HeroSlide;
use App\Models\Inscription;
use App\Models\NewsArticle;
use App\Models\Partenaire;
use App\Models\ReactivationRequest;
use App\Models\ResultatAdmission;
use App\Models\Teacher;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Everything an admin deletes from the console (except a student's account,
 * see EtudiantController::destroy — that one is a deliberate permanent wipe)
 * lands here first: soft-deleted, listed, restorable or permanently erasable.
 */
class TrashController extends Controller
{
    /**
     * One entry per trashable type: the model, the permission that already
     * gates deleting/restoring it elsewhere in the admin, a human label, the
     * field to display as its title, and how to find the uploaded file(s) to
     * remove from disk when it's permanently deleted.
     *
     * @var array<string, array{model: class-string<Model>, permission: string, label: string, title: string, files: callable}>
     */
    private const TYPES = [
        'actualites' => ['model' => NewsArticle::class, 'permission' => 'news.delete', 'label' => 'Actualité', 'title' => 'title', 'files' => [['field' => 'image_path', 'folder' => 'news']]],
        'albums-galerie' => ['model' => GalleryAlbum::class, 'permission' => 'gallery.delete', 'label' => 'Album galerie', 'title' => 'title', 'files' => [['field' => 'cover_image', 'folder' => 'galerie']]],
        'photos-galerie' => ['model' => GalleryPhoto::class, 'permission' => 'gallery.delete', 'label' => 'Photo galerie', 'title' => 'title', 'files' => [['field' => 'image_path', 'folder' => 'galerie']]],
        'documents' => ['model' => Document::class, 'permission' => 'documents.delete', 'label' => 'Document', 'title' => 'title', 'files' => [['field' => 'file_path', 'folder' => 'documents']]],
        'evenements' => ['model' => Evenement::class, 'permission' => 'evenements.delete', 'label' => 'Événement', 'title' => 'titre', 'files' => [['field' => 'image_path', 'folder' => 'evenements']]],
        'filieres' => ['model' => Filiere::class, 'permission' => 'filieres.delete', 'label' => 'Filière', 'title' => 'nom_fr', 'files' => [['field' => 'image_path', 'folder' => 'filieres']]],
        'enseignants' => ['model' => Teacher::class, 'permission' => 'enseignants.delete', 'label' => 'Enseignant', 'title' => 'name', 'files' => [['field' => 'photo_path', 'folder' => 'teachers']]],
        'temoignages' => ['model' => Testimonial::class, 'permission' => 'temoignages.delete', 'label' => 'Témoignage', 'title' => 'author_name', 'files' => [['field' => 'image_path', 'folder' => 'testimonials']]],
        'partenaires' => ['model' => Partenaire::class, 'permission' => 'partenaires.delete', 'label' => 'Partenaire', 'title' => 'nom', 'files' => [['field' => 'logo_path', 'folder' => 'partenaires']]],
        'campus' => ['model' => CampusBloc::class, 'permission' => 'campus.delete', 'label' => 'Bloc campus', 'title' => 'nom', 'files' => 'images'],
        'diapositives' => ['model' => HeroSlide::class, 'permission' => 'hero.delete', 'label' => 'Diapositive', 'title' => null, 'files' => [['field' => 'image_path', 'folder' => 'hero']]],
        'classes' => ['model' => Classe::class, 'permission' => 'classes.delete', 'label' => 'Classe', 'title' => 'nom', 'files' => []],
        'inscriptions' => ['model' => Inscription::class, 'permission' => 'inscriptions.delete', 'label' => 'Inscription', 'title' => 'numero', 'files' => []],
        'ecolage' => ['model' => EcolagePayment::class, 'permission' => 'payments.delete', 'label' => "Versement d'écolage", 'title' => 'reference', 'files' => []],
        'journal' => ['model' => ActivityLog::class, 'permission' => 'activity-log.delete', 'label' => "Journal d'activité", 'title' => 'description', 'files' => []],
        'reactivations' => ['model' => ReactivationRequest::class, 'permission' => 'reactivations.manage', 'label' => 'Demande de réactivation', 'title' => null, 'files' => []],
        'resultats' => ['model' => ResultatAdmission::class, 'permission' => 'resultats.delete', 'label' => 'Résultat', 'title' => 'nom', 'files' => []],
        'archives-resultats' => ['model' => ArchiveDossier::class, 'permission' => 'resultats.delete', 'label' => 'Dossier archivé', 'title' => 'nom', 'files' => []],
    ];

    public function index(): Response
    {
        $items = collect(self::TYPES)
            ->filter(fn (array $type) => request()->user()->can($type['permission']))
            ->flatMap(function (array $type, string $slug) {
                /** @var class-string<Model> $model */
                $model = $type['model'];

                return $model::onlyTrashed()->latest('deleted_at')->get()->map(fn (Model $record) => [
                    'type' => $slug,
                    'label' => $type['label'],
                    'id' => $record->id,
                    'title' => $type['title'] ? ($record->{$type['title']} ?? '—') : "#{$record->id}",
                    'deleted_at' => $record->deleted_at,
                ]);
            })
            ->sortByDesc('deleted_at')
            ->values();

        return Inertia::render('Admin/Corbeille/Index', ['items' => $items]);
    }

    public function restore(string $type, int $id): RedirectResponse
    {
        $config = $this->authorizedType($type);
        /** @var class-string<Model> $model */
        $model = $config['model'];
        $record = $model::onlyTrashed()->findOrFail($id);

        $record->restore();

        if ($type === 'albums-galerie') {
            /** @var GalleryAlbum $record */
            $record->photos()->onlyTrashed()->get()->each->restore();
        }

        if ($type === 'archives-resultats') {
            /** @var ArchiveDossier $record */
            $record->resultats()->onlyTrashed()->get()->each->restore();
        }

        return back()->with('status', "{$config['label']} restauré(e).");
    }

    public function forceDelete(string $type, int $id): RedirectResponse
    {
        $config = $this->authorizedType($type);
        /** @var class-string<Model> $model */
        $model = $config['model'];
        $record = $model::onlyTrashed()->findOrFail($id);

        if ($type === 'albums-galerie') {
            /** @var GalleryAlbum $record */
            foreach ($record->photos()->onlyTrashed()->get() as $photo) {
                $this->deleteFiles($photo, self::TYPES['photos-galerie']['files']);
                $photo->forceDelete();
            }
        }

        if ($type === 'archives-resultats') {
            /** @var ArchiveDossier $record */
            $record->resultats()->onlyTrashed()->get()->each->forceDelete();
        }

        $this->deleteFiles($record, $config['files']);
        $record->forceDelete();

        return back()->with('status', "{$config['label']} supprimé(e) définitivement.");
    }

    /**
     * @return array{model: class-string<Model>, permission: string, label: string, title: ?string, files: mixed}
     */
    private function authorizedType(string $type): array
    {
        abort_unless(array_key_exists($type, self::TYPES), 404);
        $config = self::TYPES[$type];
        abort_unless(request()->user()->can($config['permission']), 403);

        return $config;
    }

    /**
     * @param  array<int, array{field: string, folder: string}>|string  $files
     */
    private function deleteFiles(Model $record, array|string $files): void
    {
        // An écolage versement's proofs live on the private disk, not under /storage.
        if ($record instanceof EcolagePayment) {
            Storage::disk('local')->delete([$record->receipt_path, $record->card_path]);

            return;
        }

        // CampusBloc keeps a JSON array of paths under a single field, unlike
        // every other trashable type's single-path field.
        if (is_string($files)) {
            foreach ($record->{$files} ?? [] as $path) {
                $this->deletePath($path, 'campus');
            }

            return;
        }

        foreach ($files as $file) {
            $this->deletePath($record->{$file['field']} ?? null, $file['folder']);
        }
    }

    private function deletePath(?string $path, string $folder): void
    {
        if ($path !== null && Str::startsWith($path, "storage/{$folder}/")) {
            Storage::disk('public')->delete(Str::after($path, 'storage/'));
        }
    }
}
