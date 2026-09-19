<?php

use App\Http\Controllers\Admin\QuickEditController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])
    ->post('console/content/update', [QuickEditController::class, 'update'])
    ->name('admin.content.update');
