import { FileText, GraduationCap, Users, History, Network, HeartHandshake, Wallet, Rss, UserPlus, Mail, MessagesSquare, BookOpenCheck } from 'lucide-react';

export const getEtablissementLinks = (t) => [
    { href: '/historique', label: t('nav.historique', 'Historique'), icon: History },
    { href: '/filieres', label: t('nav.filieres', 'Filières'), icon: GraduationCap },
    { href: '/formations', label: t('nav.formations', 'Formations'), icon: BookOpenCheck },
    { href: '/enseignants', label: t('nav.enseignants', 'Enseignants'), icon: Users },
    { href: '/parcours', label: t('nav.organigramme', 'Organigramme'), icon: Network },
];

export const getVieEtudianteLinks = (t) => [
    { href: '/vie-etudiante', label: t('nav.vie_etudiante', 'Vie étudiante'), icon: HeartHandshake },
    { href: '/bourse', label: t('nav.bourse', 'Bourse'), icon: Wallet },
    { href: '/documents', label: t('nav.documents', 'Document'), icon: FileText },
];

export const getCommunauteLinks = (t) => [
    { href: '/communaute', label: t('nav.fil_communautaire', 'Fil communautaire'), icon: Rss },
    { href: '/amis', label: t('nav.amis', 'Amis'), icon: UserPlus },
    { href: '/messages', label: t('nav.messages_prives', 'Messages privés'), icon: Mail },
    { href: '/groupes', label: t('nav.groupes_classe', 'Groupes de classe'), icon: MessagesSquare },
];
