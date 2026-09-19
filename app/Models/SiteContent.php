<?php

namespace App\Models;

use App\SiteContentType;
use Database\Factories\SiteContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    /** @use HasFactory<SiteContentFactory> */
    use HasFactory;

    protected $fillable = [
        'content_key',
        'type',
        'content_value_fr',
        'content_value_en',
        'content_value_mg',
    ];

    protected function casts(): array
    {
        return [
            'type' => SiteContentType::class,
        ];
    }

    /**
     * The content value for the active locale, falling back to French when the
     * localized column is empty (some legacy content is only translated in fr/en).
     *
     * Icon values aren't locale-specific — updateForCurrentLocale() keeps all
     * three columns identical for them, so any column returns the same value.
     */
    public function localizedValue(): string
    {
        $column = 'content_value_'.app()->getLocale();

        return $this->{$column} ?: $this->content_value_fr;
    }

    /**
     * Update the value: only the active locale's column for text, or all three
     * at once for icon/image — neither is a translation, they shouldn't vary by locale.
     */
    public function updateForCurrentLocale(string $value): void
    {
        if ($this->type->isSharedAcrossLocales()) {
            $this->content_value_fr = $value;
            $this->content_value_en = $value;
            $this->content_value_mg = $value;
        } else {
            $this->{'content_value_'.app()->getLocale()} = $value;
        }

        $this->save();
    }
}
