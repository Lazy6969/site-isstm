<?php

use App\Models\Document;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing documents', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/documents')->assertForbidden();
});

it('lets an admin upload a document', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/documents', [
        'title' => "Formulaire d'inscription",
        'category' => 'public',
        'file' => UploadedFile::fake()->create('formulaire.pdf', 200, 'application/pdf'),
    ])->assertRedirect();

    $document = Document::latest('id')->first();
    expect($document->title)->toBe("Formulaire d'inscription");
    expect($document->category)->toBe('public');
    Storage::disk('public')->assertExists(str($document->file_path)->after('storage/')->toString());
});

it('rejects a disallowed file type', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/documents', [
        'title' => 'Fichier suspect',
        'category' => 'public',
        'file' => UploadedFile::fake()->create('malware.exe', 10, 'application/octet-stream'),
    ])->assertSessionHasErrors('file');
});

it('lets an admin update a document without touching its file when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $document = Document::factory()->create(['file_path' => 'storage/documents/old.pdf']);

    $this->actingAs($admin)->put("/console/documents/{$document->id}", [
        'title' => 'Titre modifié',
        'category' => $document->category,
    ])->assertRedirect();

    expect($document->refresh()->title)->toBe('Titre modifié');
    expect($document->file_path)->toBe('storage/documents/old.pdf');
});

it('replaces the uploaded file and deletes the previous one', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $document = Document::factory()->create(['file_path' => 'storage/documents/old.pdf']);
    Storage::disk('public')->put('documents/old.pdf', 'fake');

    $this->actingAs($admin)->put("/console/documents/{$document->id}", [
        'title' => $document->title,
        'category' => $document->category,
        'file' => UploadedFile::fake()->create('nouveau.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    Storage::disk('public')->assertMissing('documents/old.pdf');
    expect(Document::find($document->id)->file_path)->not->toBe('storage/documents/old.pdf');
});

it('soft-deletes a document, keeping its file until it is purged from the Corbeille', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $document = Document::factory()->create(['file_path' => 'storage/documents/old.pdf']);
    Storage::disk('public')->put('documents/old.pdf', 'fake');

    $this->actingAs($admin)->delete("/console/documents/{$document->id}")->assertRedirect();

    expect(Document::find($document->id))->toBeNull();
    expect(Document::onlyTrashed()->find($document->id))->not->toBeNull();
    Storage::disk('public')->assertExists('documents/old.pdf');
});

it('lists documents for the admin, including student-only ones', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Document::factory()->create(['category' => 'public']);
    Document::factory()->create(['category' => 'etudiant']);

    $this->actingAs($admin)->get('/console/documents')->assertInertia(fn ($page) => $page
        ->component('Admin/Documents/Index')
        ->has('documents', 2)
    );
});
