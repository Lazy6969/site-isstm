<?php

namespace App;

enum PostVisibility: string
{
    case Public = 'public';
    case Amis = 'amis';

    public function label(): string
    {
        return match ($this) {
            self::Public => 'Public',
            self::Amis => 'Amis',
        };
    }
}
