import { Calendar, ClipboardList, GraduationCap, PenSquare, Sun, UserPlus } from 'lucide-react';

/** Icon + accent color per `evenements.categorie`, shared by the calendar and the ticket list. */
export const CATEGORY_META = {
    general: { icon: Calendar, color: '#003366' },
    examen: { icon: PenSquare, color: '#c0392b' },
    ceremonie: { icon: GraduationCap, color: '#8e44ad' },
    atelier: { icon: ClipboardList, color: '#2980b9' },
    vacances: { icon: Sun, color: '#2ecc71' },
    inscription: { icon: UserPlus, color: '#d4a017' },
};
