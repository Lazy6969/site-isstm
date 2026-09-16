export const direction = [
    { title: 'PRMP', name: 'Mme. Gestion F.' },
    { title: 'Conseil Scientifique', name: 'M. Lovas R.' },
    { title: 'Collège des Enseignants', name: 'Mme. Nathalie V.' },
    { title: 'Secrétariat de direction', name: 'Mme. Secrétaire P.' },
    { title: "Responsable d'Assurance qualité", name: 'M. Maxwell A.' },
    { title: 'Responsable de la communication', name: 'M. Judickael M.' },
];

export const pedagogicalPole = {
    title: 'Coordonnateur des activités pédagogiques',
    name: 'Mme. Nathalie V.',
    children: [
        {
            title: 'Sciences et Techniques du Numérique et Physiques Appliquées (STNPA)',
            name: 'M. Hary L.',
            children: [
                { title: 'Parcours Génie Informatique', name: 'M. Hary L.', role: 'Chef de Parcours' },
                { title: 'Parcours Génie Biomédical', name: 'M. Chrysostome', role: 'Chef de Parcours' },
                { title: 'Parcours Génie Électronique Informatique', name: 'M. Telesphore', role: 'Chef de Parcours' },
            ],
        },
        {
            title: 'Sciences et Technologies Industrielles (STI)',
            name: 'M. Telesphore',
            children: [
                { title: 'Parcours Génie Électrique', name: 'M. Maxwell A.', role: 'Chef de Parcours' },
                { title: 'Parcours Génie Industriel', name: 'Mme. Gestion F.', role: 'Chef de Parcours' },
                { title: 'Parcours Génie Thermique', name: 'M. Lovas R.', role: 'Chef de Parcours' },
            ],
        },
        {
            title: 'Mention Génie Civil',
            name: 'Dr. Charles R.',
            children: [
                { title: 'Parcours Génie Civil', name: 'Dr. Charles R.', role: 'Chef de Parcours' },
                { title: 'Parcours Génie Hydraulique', name: 'M. Moïse D.', role: 'Chef de Parcours' },
                { title: 'Parcours Génie Architecture', name: 'M. Moïse D.', role: 'Chef de Parcours' },
            ],
        },
        {
            title: 'Service de la coopération et du partenariat',
            name: 'Mme. Gestion F.',
            children: [
                { title: 'Division Coopérations et relations extérieures', name: 'Mme. Gestion F.' },
                { title: 'Division des laboratoires et ateliers', name: 'M. Lovas R.' },
                { title: 'Division Relations entreprises (stage & visites industrielles)', name: 'M. Maxwell A.' },
            ],
        },
        {
            title: 'Service statistique et HC',
            name: 'M. Maxwell A.',
            children: [
                { title: 'Agent des affaires des enseignants', name: 'Mme. Secrétaire P.' },
                { title: 'Responsable de la statistique et des relations avec les diplômés', name: 'M. Maxwell A.' },
            ],
        },
    ],
};

export const administrativePole = {
    title: 'Secrétaire principal',
    name: 'Mme. Secrétaire P.',
    children: [
        { title: 'Service de la comptabilité', name: 'M. Chrysostome' },
        { title: 'Service du numérique', name: 'M. Judickael M.' },
        {
            title: 'Service de la scolarité',
            name: 'Mme. Secrétaire P.',
            children: [
                { title: 'Secrétariats pédagogiques Master', name: 'Mme. Nathalie V.' },
                { title: 'Secrétariats pédagogiques Licence', name: 'Mme. Secrétaire P.' },
                { title: 'Responsable des diplômes et certification', name: 'M. Judickael M.' },
            ],
        },
        {
            title: 'Service logistique et technique',
            name: 'M. Chrysostome',
            children: [
                { title: 'Division de la logistique', name: 'M. Chrysostome' },
                { title: 'Division technique', name: 'M. Telesphore' },
                { title: 'Responsable bibliothèque', name: 'Mme. Nathalie V.' },
            ],
        },
    ],
};

export const cursusLadder = [
    { key: 'bacc', level: 'BACC Scientifique (Série C, D, A2 et Technique)', items: ['Sélection des dossiers'] },
    { key: 'l1l2', level: 'L1 et L2', items: ['Base des études supérieures + matières de base', "Examen (Test d'évaluation)"] },
    { key: 'l3', level: 'L3', items: ["Stage de fin d'étude de 3 mois minimum en entreprise, société ou hôpital", "Soutenance de mémoire de fin d'étude de formation"] },
    { key: 'm1', level: 'M1', items: ['Formation en tronc commun en S7 et S8', 'Formation par spécialité de chaque parcours'] },
    { key: 'm2', level: 'M2', items: ["Soutenance de mémoire de fin d'études de formation"] },
];
