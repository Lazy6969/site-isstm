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

it('gives the admin page the files already added, keyed by slot', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $pdf = Document::factory()->create(['slug' => 'cursus_pdf', 'category' => 'etudiant', 'file_path' => 'storage/documents/cursus.pdf']);
    Document::factory()->create(['slug' => null, 'title' => 'Un document libre']);

    $this->actingAs($admin)->get('/console/organigramme')->assertInertia(fn ($page) => $page
        ->component('Admin/Organigramme/Index')
        ->has('documents', 1)
        ->where('documents.cursus_pdf.file_path', $pdf->file_path)
        ->missing('documents.organigramme_pdf')
    );
});

it('only accepts the right format in each slot', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/organigramme/documents/organigramme_word', [
        'file' => UploadedFile::fake()->create('organigramme.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('file');
    $this->actingAs($admin)->post('/console/organigramme/documents/organigramme_pdf', [
        'file' => UploadedFile::fake()->create('organigramme.docx', 100, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    ])->assertSessionHasErrors('file');
    $this->actingAs($admin)->post('/console/organigramme/documents/cursus_image', [
        'file' => UploadedFile::fake()->create('cursus.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('file');

    expect(Document::count())->toBe(0);

    $this->actingAs($admin)->post('/console/organigramme/documents/organigramme_word', [
        'file' => UploadedFile::fake()->create('organigramme.docx', 100, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    ])->assertSessionHasNoErrors();
    expect(Document::where('slug', 'organigramme_word')->exists())->toBeTrue();
});

it('lets an admin take a format off the page and put one back later', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $user = User::factory()->create(['is_active' => true]);

    $this->actingAs($admin)->post('/console/organigramme/documents/cursus_pdf', [
        'file' => UploadedFile::fake()->create('cursus.pdf', 100, 'application/pdf'),
    ])->assertRedirect();
    $this->actingAs($user)->get('/parcours')->assertInertia(fn ($page) => $page->has('orgDocuments.cursus_pdf'));

    $this->actingAs($admin)->delete('/console/organigramme/documents/cursus_pdf')->assertRedirect();

    $this->actingAs($user)->get('/parcours')->assertInertia(fn ($page) => $page->missing('orgDocuments.cursus_pdf'));
    expect(Document::withTrashed()->where('slug', 'cursus_pdf')->count())->toBe(1);

    $this->actingAs($admin)->post('/console/organigramme/documents/cursus_pdf', [
        'file' => UploadedFile::fake()->create('cursus-v2.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    $this->actingAs($user)->get('/parcours')->assertInertia(fn ($page) => $page->has('orgDocuments.cursus_pdf'));
    expect(Document::withTrashed()->where('slug', 'cursus_pdf')->count())->toBe(1)
        ->and(Document::where('slug', 'cursus_pdf')->count())->toBe(1);
});

it('rejects removing an unknown slot and forbids a non-admin from removing a file', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = User::factory()->role(Role::Etudiant)->create();
    Document::factory()->create(['slug' => 'organigramme_pdf', 'category' => 'etudiant']);

    $this->actingAs($admin)->delete('/console/organigramme/documents/not-a-real-slug')->assertNotFound();
    $this->actingAs($etudiant)->delete('/console/organigramme/documents/organigramme_pdf')->assertForbidden();
    expect(Document::where('slug', 'organigramme_pdf')->exists())->toBeTrue();
});
