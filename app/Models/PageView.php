<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One row per full page visit (see App\Http\Middleware\TrackPageView) — an
 * append-only log, never updated, so there's no updated_at to maintain.
 */
class PageView extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'path',
    ];
}
