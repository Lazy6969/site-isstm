<?php

namespace App\Models;

use Database\Factories\SiteContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    /** @use HasFactory<SiteContentFactory> */
    use HasFactory;

    protected $fillable = [
        'content_key',
        'content_value_fr',
        'content_value_en',
        'content_value_mg',
    ];

    /**
     * The content value for the active locale, falling back to French when the
     * localized column is empty (some legacy content is only translated in fr/en).
     */
    public function localizedValue(): string
    {
        $column = 'content_value_'.app()->getLocale();

        return $this->{$column} ?: $this->content_value_fr;
    }
}
