import {
    Mail,
    Phone,
    MapPin,
    Link2,
    GraduationCap,
    Users,
    Compass,
    BookOpen,
    School,
    Award,
    Star,
    Heart,
    Globe,
    Building2,
    Calendar,
    FileText,
    Briefcase,
    Lightbulb,
    Target,
    TrendingUp,
    Shield,
    Clock,
    CheckCircle,
    Info,
    Crown,
    Server,
    Sparkles,
    Wrench,
} from 'lucide-react';

/**
 * Mirrors the PHP SiteIcon enum (app/SiteIcon.php) by name — keep both lists
 * in sync. A stored value not in this map falls back to Info rather than
 * crashing the page.
 */
export const ICONS = {
    Mail,
    Phone,
    MapPin,
    Link2,
    GraduationCap,
    Users,
    Compass,
    BookOpen,
    School,
    Award,
    Star,
    Heart,
    Globe,
    Building2,
    Calendar,
    FileText,
    Briefcase,
    Lightbulb,
    Target,
    TrendingUp,
    Shield,
    Clock,
    CheckCircle,
    Info,
    Crown,
    Server,
    Sparkles,
    Wrench,
};

export function getIcon(name) {
    return ICONS[name] ?? Info;
}
