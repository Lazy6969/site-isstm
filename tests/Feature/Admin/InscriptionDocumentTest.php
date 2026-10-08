<?php

use App\Models\Document;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from uploading the préinscription dossier', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->post('/console/inscription/dossier-preinscription', [
        'file' => UploadedFile::fake()->create('dossier.pdf', 100, 'application/pdf'),
    ])->assertForbidden();
});

it('lets an admin upload the préinscription dossier and replaces it on a later upload', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/inscription/dossier-preinscription', [
        'file' => UploadedFile::fake()->create('dossier.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    $document = Document::where('slug', 'dossier_preinscription')->first();
    expect($document)->not->toBeNull();
    expect($document->category)->toBe('public');
    $firstPath = str($document->file_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);

    $this->actingAs($admin)->post('/console/inscription/dossier-preinscription', [
        'file' => UploadedFile::fake()->create('dossier-v2.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    Storage::disk('public')->assertMissing($firstPath);
    expect(Document::where('slug', 'dossier_preinscription')->count())->toBe(1);
});

it('rejects a file type other than pdf/doc/docx', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/inscription/dossier-preinscription', [
        'file' => UploadedFile::fake()->create('dossier.exe', 100, 'application/octet-stream'),
    ])->assertSessionHasErrors('file');
});
