<?php

namespace App;

/**
 * The homepage sections a super admin can hide/show in place (see
 * SectionVisibilityController). Header, Hero, Contact and Footer are
 * structural (navigation/contact info) and deliberately excluded — hiding
 * them would break the page, not just tidy it up.
 */
enum HomeSection: string
{
    case Stats = 'stats';
    case Director = 'director';
    case MissionVision = 'mission_vision';
    case Filieres = 'filieres';
    case Actualites = 'actualites';
    case Testimonials = 'testimonials';
    case Partenaires = 'partenaires';

    public function label(): string
    {
        return match ($this) {
            self::Stats => 'Statistiques',
            self::Director => 'Mot du Directeur',
            self::MissionVision => 'Mission & Vision',
            self::Filieres => 'Filières',
            self::Actualites => 'Actualités',
            self::Testimonials => 'Témoignages',
            self::Partenaires => 'Partenaires',
        };
    }
}
