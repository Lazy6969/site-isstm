<?php

use App\Models\Document;
use App\Models\DocumentDownload;
use App\Models\DocumentInteraction;
use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    File::ensureDirectoryExists(public_path('storage-test'));
    File::put(public_path('storage-test/fiche.pdf'), 'contenu');
});

afterEach(function () {
    File::deleteDirectory(public_path('storage-test'));
});

it('records an anonymous download of a public document and sends the file', function () {
    $document = Document::factory()->create(['category' => 'public', 'file_path' => 'storage-test/fiche.pdf']);

    $this->get('/telecharger?fichier='.urlencode($document->file_path))->assertOk();

    $this->assertDatabaseHas('document_downloads', ['document_id' => $document->id, 'user_id' => null]);
});

it('records who downloaded a document', function () {
    $document = Document::factory()->create(['category' => 'public', 'file_path' => 'storage-test/fiche.pdf']);
    $user = User::factory()->create();

    $this->actingAs($user)->get('/telecharger?fichier='.urlencode($document->file_path))->assertOk();

    expect(DocumentDownload::where('user_id', $user->id)->count())->toBe(1);
});

it('keeps student documents behind a login and does not record the refused attempt', function () {
    $document = Document::factory()->create(['category' => 'etudiant', 'file_path' => 'storage-test/fiche.pdf']);

    $this->get('/telecharger?fichier='.urlencode($document->file_path))->assertForbidden();

    expect(DocumentDownload::count())->toBe(0);
});

it('refuses a file that is not a known document', function () {
    $this->get('/telecharger?fichier='.urlencode('storage-test/fiche.pdf'))->assertNotFound();
    $this->get('/telecharger?fichier='.urlencode('../.env'))->assertNotFound();
});

it('shows the download tracking page only to users who can view documents', function () {
    $this->get('/console/telechargements')->assertRedirect();

    $this->actingAs(User::factory()->create())->get('/console/telechargements')->assertForbidden();
});

it('gives an admin the download counts and the log of who downloaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $reader = User::factory()->create(['name' => 'Lecteur Test']);
    $document = Document::factory()->create(['title' => 'Fiche suivie', 'category' => 'public']);
    DocumentDownload::create(['document_id' => $document->id, 'user_id' => $reader->id, 'ip_address' => '10.0.0.1']);
    DocumentDownload::create(['document_id' => $document->id, 'user_id' => null, 'ip_address' => '10.0.0.2']);

    $this->actingAs($admin)->get('/console/telechargements')->assertOk()->assertInertia(fn ($page) => $page
        ->component('Admin/Documents/Downloads')
        ->where('stats.total', 2)
        ->where('stats.identified_users', 1)
        ->where('documents.0.downloads_count', 2)
        ->where('downloads.0.document_title', 'Fiche suivie')
    );
});

it('records a view when a document is consulted and a share when its link is shared', function () {
    $document = Document::factory()->create(['category' => 'public', 'file_path' => 'storage-test/fiche.pdf']);

    $this->get('/consulter?fichier='.urlencode($document->file_path))->assertOk();
    $this->postJson('/documents/partage', ['fichier' => $document->file_path])->assertNoContent();

    expect($document->views()->count())->toBe(1)
        ->and($document->shares()->count())->toBe(1)
        ->and($document->downloads()->count())->toBe(0);
});

it('keeps student documents behind a login for consulting and sharing too', function () {
    $document = Document::factory()->create(['category' => 'etudiant', 'file_path' => 'storage-test/fiche.pdf']);

    $this->get('/consulter?fichier='.urlencode($document->file_path))->assertForbidden();
    $this->postJson('/documents/partage', ['fichier' => $document->file_path])->assertForbidden();

    expect(DocumentInteraction::count())->toBe(0);
});

it('exposes views and shares per document to the admin tracking page', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $document = Document::factory()->create(['category' => 'public']);
    DocumentInteraction::create(['document_id' => $document->id, 'type' => 'view']);
    DocumentInteraction::create(['document_id' => $document->id, 'type' => 'view']);
    DocumentInteraction::create(['document_id' => $document->id, 'type' => 'share']);

    $this->actingAs($admin)->get('/console/telechargements')->assertInertia(fn ($page) => $page
        ->where('documents.0.views_count', 2)
        ->where('documents.0.shares_count', 1)
        ->where('documents.0.downloads_count', 0)
    );
});
