<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'event_type',
        'identifier',
        'ip_address',
        'details',
    ];

    public static function record(string $eventType, ?string $identifier, ?string $details = null): void
    {
        static::create([
            'event_type' => $eventType,
            'identifier' => $identifier,
            'ip_address' => request()->ip(),
            'details' => $details,
        ]);
    }
}
