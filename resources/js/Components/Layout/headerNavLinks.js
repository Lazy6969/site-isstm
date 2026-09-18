export const getEtablissementLinks = (t) => [
    { href: '/filieres', label: t('nav.filieres', 'Filières') },
    { href: '/enseignants', label: t('nav.enseignants', 'Enseignants') },
    { href: '/historique', label: t('nav.historique', 'Historique') },
    { href: '/parcours', label: t('nav.organigramme', 'Organigramme') },
];

export const getVieEtudianteLinks = (t) => [
    { href: '/vie-etudiante', label: t('nav.vie_etudiante', 'Vie étudiante') },
    { href: '/bourse', label: t('nav.bourse', 'Bourse') },
    { href: '/documents', label: t('nav.documents', 'Documents administratifs') },
    { href: '/campus', label: t('nav.campus', 'Campus & blocs régionaux') },
    { href: '/associations', label: t('nav.associations', 'Associations (AEI)') },
];

export const getCommunauteLinks = (t) => [
    { href: '/communaute', label: t('nav.fil_communautaire', 'Fil communautaire') },
    { href: '/amis', label: t('nav.amis', 'Amis') },
    { href: '/messages', label: t('nav.messages_prives', 'Messages privés') },
    { href: '/groupes', label: t('nav.groupes_classe', 'Groupes de classe') },
];
