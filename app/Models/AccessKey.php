<?php

namespace App\Models;

use Database\Factories\AccessKeyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AccessKey extends Model
{
    /** @use HasFactory<AccessKeyFactory> */
    use HasFactory;

    /**
     * Subdomain slug → Spatie role name, the single source of truth for
     * which departments have a subdomain admin space with a key gate.
     *
     * @var array<string, string>
     */
    public const DEPARTMENTS = [
        'scolarite' => 'scolarite',
        'enseignant' => 'enseignant',
        'materiel' => 'responsable-materiel',
    ];

    protected $fillable = [
        'role',
        'key_hash',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Generates a new random key, stores only its hash, and activates it.
     * Returns the plain-text key — the only time it is ever available, so
     * the caller must show it to the Super Admin immediately.
     */
    public function generateKey(): string
    {
        $plain = Str::random(24);

        $this->forceFill([
            'key_hash' => Hash::make($plain),
            'is_active' => true,
        ])->save();

        return $plain;
    }

    public function matches(?string $plain): bool
    {
        return $this->key_hash !== null && $plain !== null && Hash::check($plain, $this->key_hash);
    }
}
