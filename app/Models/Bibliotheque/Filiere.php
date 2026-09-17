<?php

namespace App\Models\Bibliotheque;

use App\CanevasNiveau;
use Database\Factories\Bibliotheque\FiliereFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Filiere extends Model
{
    /** @use HasFactory<FiliereFactory> */
    use HasFactory;

    protected $connection = 'bibliotheque';

    protected $fillable = [
        'nom',
        'abreviation',
        'niveau',
        'mention_id',
    ];

    protected function casts(): array
    {
        return [
            'niveau' => CanevasNiveau::class,
        ];
    }

    public function mention(): BelongsTo
    {
        return $this->belongsTo(Mention::class);
    }

    public function memoires(): HasMany
    {
        return $this->hasMany(Memoire::class);
    }
}
