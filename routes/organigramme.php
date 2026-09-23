<?php

use App\Http\Controllers\Admin\OrgPersonController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('console/organigramme')->name('admin.organigramme.')->group(function () {
    Route::get('/', [OrgPersonController::class, 'index'])->middleware('can:organigramme.view')->name('index');
    Route::put('{orgPerson}', [OrgPersonController::class, 'update'])->middleware('can:organigramme.edit')->name('update');
});
