<?php

namespace App\Models;

use Database\Factories\FiliereFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Filiere extends Model
{
    /** @use HasFactory<FiliereFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'mention',
        'niveaux',
        'slug',
        'nom_fr',
        'nom_en',
        'nom_mg',
        'description_fr',
        'description_en',
        'description_mg',
        'debouches_fr',
        'debouches_en',
        'debouches_mg',
        'historique_fr',
        'historique_en',
        'historique_mg',
        'avantages_fr',
        'avantages_en',
        'avantages_mg',
        'image_path',
        'display_order',
    ];

    /**
     * A {$field}_{locale} value, falling back to French when the localized
     * column is empty (some filières are only fully translated in fr/en).
     */
    public function localized(string $field): ?string
    {
        $locale = app()->getLocale();

        return $this->{"{$field}_{$locale}"} ?: $this->{"{$field}_fr"};
    }

    public function classes(): HasMany
    {
        return $this->hasMany(Classe::class);
    }
}
