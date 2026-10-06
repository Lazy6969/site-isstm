<?php

use App\Models\Document;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('hides the organigramme documents from a guest', function () {
    Document::factory()->create(['slug' => 'organigramme_pdf', 'category' => 'etudiant']);

    $this->get('/parcours')->assertInertia(fn ($page) => $page
        ->component('Parcours')
        ->where('orgDocuments', [])
    );
});

it('hides the organigramme documents from a logged-in but inactive account', function () {
    Document::factory()->create(['slug' => 'organigramme_pdf', 'category' => 'etudiant']);
    $user = User::factory()->create(['is_active' => false]);

    $this->actingAs($user)->get('/parcours')->assertInertia(fn ($page) => $page
        ->where('orgDocuments', [])
    );
});

it('exposes each available format of the organigramme documents to a logged-in, active account', function () {
    $pdf = Document::factory()->create(['slug' => 'organigramme_pdf', 'category' => 'etudiant', 'file_path' => 'images/organigramme/organigramme.pdf']);
    $word = Document::factory()->create(['slug' => 'organigramme_word', 'category' => 'etudiant', 'file_path' => 'images/organigramme/organigramme.docx']);
    $user = User::factory()->create(['is_active' => true]);

    $this->actingAs($user)->get('/parcours')->assertInertia(fn ($page) => $page
        ->where('orgDocuments.organigramme_pdf', $pdf->file_path)
        ->where('orgDocuments.organigramme_word', $word->file_path)
        ->missing('orgDocuments.organigramme_image')
    );
});

it('forbids a non-admin from uploading an organigramme document', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->post('/console/organigramme/documents/organigramme_pdf', [
        'file' => UploadedFile::fake()->create('organigramme.pdf', 100, 'application/pdf'),
    ])->assertForbidden();
});

it('rejects an unknown document slug', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/organigramme/documents/not-a-real-slug', [
        'file' => UploadedFile::fake()->create('fichier.pdf', 100, 'application/pdf'),
    ])->assertNotFound();
});

it('lets an admin upload the organigramme document and replaces it on a later upload', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/organigramme/documents/organigramme_pdf', [
        'file' => UploadedFile::fake()->create('organigramme.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    $document = Document::where('slug', 'organigramme_pdf')->first();
    expect($document)->not->toBeNull();
    $firstPath = str($document->file_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);

    $this->actingAs($admin)->post('/console/organigramme/documents/organigramme_pdf', [
        'file' => UploadedFile::fake()->create('organigramme-v2.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    Storage::disk('public')->assertMissing($firstPath);
    expect(Document::where('slug', 'organigramme_pdf')->count())->toBe(1);
});

it('lets an admin upload the image format of a document', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/organigramme/documents/cursus_image', [
        'file' => UploadedFile::fake()->image('cursus.jpg'),
    ])->assertRedirect();

    expect(Document::where('slug', 'cursus_image')->exists())->toBeTrue();
});
