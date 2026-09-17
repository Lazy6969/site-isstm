<?php

namespace App\Models\Bibliotheque;

use Database\Factories\Bibliotheque\MentionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mention extends Model
{
    /** @use HasFactory<MentionFactory> */
    use HasFactory;

    protected $connection = 'bibliotheque';

    protected $fillable = [
        'nom',
        'abreviation',
    ];

    public function filieres(): HasMany
    {
        return $this->hasMany(Filiere::class);
    }
}
