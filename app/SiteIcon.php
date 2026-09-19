<?php

namespace App;

/**
 * Whitelist of icons a Super Admin may pick for an "icon"-type SiteContent.
 * Each value must match the exact Lucide React export name — the frontend
 * icon picker/registry (resources/js/Components/QuickEdit/icons.js) mirrors
 * this list by name so a stored value always resolves to a real component.
 */
enum SiteIcon: string
{
    case Mail = 'Mail';
    case Phone = 'Phone';
    case MapPin = 'MapPin';
    case Link2 = 'Link2';
    case GraduationCap = 'GraduationCap';
    case Users = 'Users';
    case Compass = 'Compass';
    case BookOpen = 'BookOpen';
    case School = 'School';
    case Award = 'Award';
    case Star = 'Star';
    case Heart = 'Heart';
    case Globe = 'Globe';
    case Building2 = 'Building2';
    case Calendar = 'Calendar';
    case FileText = 'FileText';
    case Briefcase = 'Briefcase';
    case Lightbulb = 'Lightbulb';
    case Target = 'Target';
    case TrendingUp = 'TrendingUp';
    case Shield = 'Shield';
    case Clock = 'Clock';
    case CheckCircle = 'CheckCircle';
    case Info = 'Info';
}
