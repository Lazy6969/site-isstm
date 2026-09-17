<?php

namespace App;

enum ReactionType: string
{
    case Like = 'like';
    case Love = 'love';

    public function label(): string
    {
        return match ($this) {
            self::Like => 'J\'aime',
            self::Love => 'J\'adore',
        };
    }
}
