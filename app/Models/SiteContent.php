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
        'style',
    ];

    protected function casts(): array
    {
        return [
            'type' => SiteContentType::class,
            'style' => 'array',
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
     * Update the value: only one locale's column for text, or all three at
     * once for icon/image — neither is a translation, they shouldn't vary by
     * locale. Defaults to the active app locale, so in-place quick edit on a
     * public page (which never sends $locale) keeps editing whatever locale
     * the visitor is currently browsing in; the admin content list passes an
     * explicit $locale to edit any of the three regardless of site language.
     *
     * When French is the locale being set, the caller (QuickEditController)
     * is responsible for machine-translating into English/Malagasy afterward
     * — that's an external API call, deliberately kept out of the model.
     */
    public function updateForCurrentLocale(string $value, ?string $locale = null): void
    {
        if ($this->type->isSharedAcrossLocales()) {
            $this->content_value_fr = $value;
            $this->content_value_en = $value;
            $this->content_value_mg = $value;
        } else {
            $this->{'content_value_'.($locale ?? app()->getLocale())} = $value;
        }

        $this->save();
    }
}
