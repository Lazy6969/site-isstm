<?php

namespace App;

enum PresenceStatus: string
{
    case Present = 'present';
    case Absent = 'absent';

    public function label(): string
    {
        return match ($this) {
            self::Present => 'Présent',
            self::Absent => 'Absent',
        };
    }
}
