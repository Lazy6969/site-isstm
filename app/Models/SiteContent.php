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
     * Content keys with this prefix store an override of a language-file string
     * (the ones rendered through the front-end `t('key', 'fallback')`), so those
     * texts can be quick-edited like any other content. The prefix is followed by
     * the original translation key, e.g. `ui.inscription.dossiers_titre`.
     */
    public const UI_PREFIX = 'ui.';

    /**
     * The active locale's language-file strings, each replaced by its quick-edit
     * override when one exists — what the front end receives as `translations`.
     *
     * @return array<string, string>
     */
    public static function translationsWithOverrides(): array
    {
        $base = app('translator')->getLoader()->load(app()->getLocale(), '*', '*');

        $overrides = static::where('content_key', 'like', static::UI_PREFIX.'%')->get()
            ->mapWithKeys(fn (self $content) => [substr($content->content_key, strlen(static::UI_PREFIX)) => $content->localizedValue()]);

        return array_merge($base, $overrides->all());
    }

    /**
     * Returns the override row for a language-file string, creating it from the
     * three language files on first edit. Only keys that really exist in the
     * French file are accepted, so this can never create rows under arbitrary keys.
     */
    public static function ensureUiString(string $contentKey): ?self
    {
        if (! str_starts_with($contentKey, static::UI_PREFIX)) {
            return null;
        }

        $existing = static::where('content_key', $contentKey)->first();
        if ($existing !== null) {
            return $existing;
        }

        $translationKey = substr($contentKey, strlen(static::UI_PREFIX));
        $loader = app('translator')->getLoader();
        $fr = $loader->load('fr', '*', '*');

        if (! isset($fr[$translationKey]) || ! is_string($fr[$translationKey])) {
            return null;
        }

        $en = $loader->load('en', '*', '*');
        $mg = $loader->load('mg', '*', '*');

        return static::create([
            'content_key' => $contentKey,
            'type' => SiteContentType::Text,
            'content_value_fr' => $fr[$translationKey],
            'content_value_en' => is_string($en[$translationKey] ?? null) ? $en[$translationKey] : $fr[$translationKey],
            'content_value_mg' => is_string($mg[$translationKey] ?? null) ? $mg[$translationKey] : $fr[$translationKey],
        ]);
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
