<?php

namespace App;

enum ReactionType: string
{
    case Like = 'like';
    case Love = 'love';
    case Haha = 'haha';
    case Wouah = 'wouah';
    case Triste = 'triste';
    case Grr = 'grr';

    public function label(): string
    {
        return match ($this) {
            self::Like => 'J\'aime',
            self::Love => 'J\'adore',
            self::Haha => 'Haha',
            self::Wouah => 'Wouah',
            self::Triste => 'Triste',
            self::Grr => 'Grr',
        };
    }

    public function emoji(): string
    {
        return match ($this) {
            self::Like => '👍',
            self::Love => '❤️',
            self::Haha => '😂',
            self::Wouah => '😮',
            self::Triste => '😢',
            self::Grr => '😡',
        };
    }
}
