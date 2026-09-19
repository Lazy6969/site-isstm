<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Shared upload/replace/delete logic for admin-managed images stored under
 * storage/app/public/{folder}, referenced in the DB as "storage/{folder}/x.jpg"
 * — public pages already render every image_path-style column as a bare
 * `/${value}`, so this prefix is what makes an uploaded file resolve, while a
 * bundled asset like "images/x.jpg" is left alone (see also Admin\QuickEditController,
 * which uses the same convention for site_contents images).
 */
trait ManagesUploadedImages
{
    private function storeUploadedImage(Request $request, string $field, string $folder): string
    {
        return 'storage/'.$request->file($field)->store($folder, 'public');
    }

    private function deleteUploadedImage(?string $path, string $folder): void
    {
        if ($path !== null && Str::startsWith($path, "storage/{$folder}/")) {
            Storage::disk('public')->delete(Str::after($path, 'storage/'));
        }
    }
}
