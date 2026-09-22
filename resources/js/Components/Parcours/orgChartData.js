/**
 * Static shape of the ISSTM org chart (who nests under whom). Only the
 * `title_key`s are hardcoded here — each node's actual `name`/`photo_path`
 * comes from the `org_people` DB table (admin-editable) and is merged in at
 * render time by Parcours.jsx. This mirrors the legacy PHP site's
 * parcours.php + admin_organigramme.php split: fixed tree, DB-driven people.
 */

/** French fallback label for every title_key, used as the `t()` default. */
export const roleLabels = {
    conseil_etablissement: "Conseil d'Établissement",
    directeur: 'Directeur',
    prmp: 'PRMP',
    conseil_scientifique: 'Conseil Scientifique',
    college_enseignants: 'Collège des Enseignants',
    secretariat_direction: 'Secrétariat de direction',
    resp_qualite: "Responsable d'Assurance qualité",
    resp_comm: 'Responsable de la communication',
    coordo_pedagogique: 'Coordonnateur des activités pédagogiques',
    mention_gc: 'Mention Génie Civil',
    mention_sti: 'Sciences et Technologies Industrielles (STI)',
    mention_stnpa: 'Sciences et Techniques du Numérique et Physiques Appliquées (STNPA)',
    parcours_gi: 'Parcours Génie Informatique',
    parcours_gb: 'Parcours Génie Biomédical',
    parcours_gei: 'Parcours Génie Électronique Informatique',
    parcours_ge: 'Parcours Génie Électrique',
    parcours_gind: 'Parcours Génie Industriel',
    parcours_gt: 'Parcours Génie Thermique',
    parcours_gcivil: 'Parcours Génie Civil',
    parcours_ghyd: 'Parcours Génie Hydraulique',
    parcours_garchi: 'Parcours Génie Architecture',
    service_cooperation: 'Service de la coopération et du partenariat',
    division_coop: 'Division Coopérations et relations extérieures',
    division_labo: 'Division des laboratoires et ateliers',
    division_relations: 'Division Relations entreprises (stage & visites industrielles)',
    secretaire_principal: 'Secrétaire principal',
    service_compta: 'Service de la comptabilité',
    service_numerique: 'Service du numérique',
    service_scolarite: 'Service de la scolarité',
    secretariat_master: 'Secrétariats pédagogiques Master',
    secretariat_licence: 'Secrétariats pédagogiques Licence',
    resp_diplomes: 'Responsable des diplômes et certification',
    service_logistique: 'Service logistique et technique',
    division_logistique: 'Division de la logistique',
    division_technique: 'Division technique',
    resp_biblio: 'Responsable bibliothèque',
    service_stats: 'Service statistique et HC',
    agent_affaires: 'Agent des affaires des enseignants',
    resp_stats_diplomes: 'Responsable de la statistique et des relations avec les diplômés',
    chef_de_parcours: 'Chef de Parcours',
};

/**
 * 10 visually-distinct categories used to color-code the chart, consolidated
 * from the legacy site's finer-grained CSS classes. `swatch` is used in the
 * legend, `node` styles the card itself (light + dark).
 */
export const categories = {
    gouvernance: {
        label: 'Gouvernance',
        swatch: 'bg-slate-500',
        node: 'border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/60 dark:hover:bg-slate-800',
    },
    instances: {
        label: 'Conseils & instances collégiales',
        swatch: 'bg-violet-500',
        node: 'border-violet-200 bg-violet-50 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:hover:bg-violet-950/70',
    },
    qualite: {
        label: 'Qualité, achats & communication',
        swatch: 'bg-amber-500',
        node: 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-950/70',
    },
    secretariats: {
        label: 'Secrétariats',
        swatch: 'bg-rose-500',
        node: 'border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:hover:bg-rose-950/70',
    },
    poles: {
        label: 'Pôles (racines)',
        swatch: 'bg-teal-500',
        node: 'border-teal-200 bg-teal-50 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:hover:bg-teal-950/70',
    },
    mentions: {
        label: 'Mentions',
        swatch: 'bg-indigo-500',
        node: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70',
    },
    servicesPole: {
        label: 'Services de coordination du pôle',
        swatch: 'bg-orange-500',
        node: 'border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/40 dark:hover:bg-orange-950/70',
    },
    parcours: {
        label: 'Parcours & unités pédagogiques',
        swatch: 'bg-sky-500',
        node: 'border-sky-200 bg-sky-50 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:hover:bg-sky-950/70',
    },
    cooperation: {
        label: 'Coopération, laboratoires & relations',
        swatch: 'bg-emerald-500',
        node: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70',
    },
    administratif: {
        label: 'Services administratifs & techniques',
        swatch: 'bg-cyan-500',
        node: 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/40 dark:hover:bg-cyan-950/70',
    },
};

/** title_key -> category key, covering all 39 DB-driven roles. */
export const titleCategory = {
    conseil_etablissement: 'gouvernance',
    directeur: 'gouvernance',

    conseil_scientifique: 'instances',
    college_enseignants: 'instances',

    prmp: 'qualite',
    resp_qualite: 'qualite',
    resp_comm: 'qualite',

    secretariat_direction: 'secretariats',
    secretariat_master: 'secretariats',
    secretariat_licence: 'secretariats',

    coordo_pedagogique: 'poles',
    secretaire_principal: 'poles',

    mention_gc: 'mentions',
    mention_sti: 'mentions',
    mention_stnpa: 'mentions',

    service_cooperation: 'servicesPole',
    service_stats: 'servicesPole',
    service_scolarite: 'servicesPole',
    service_logistique: 'servicesPole',

    parcours_gi: 'parcours',
    parcours_gb: 'parcours',
    parcours_gei: 'parcours',
    parcours_ge: 'parcours',
    parcours_gind: 'parcours',
    parcours_gt: 'parcours',
    parcours_gcivil: 'parcours',
    parcours_ghyd: 'parcours',
    parcours_garchi: 'parcours',
    resp_diplomes: 'parcours',
    agent_affaires: 'parcours',
    resp_stats_diplomes: 'parcours',

    division_coop: 'cooperation',
    division_labo: 'cooperation',
    division_relations: 'cooperation',

    service_compta: 'administratif',
    service_numerique: 'administratif',
    division_logistique: 'administratif',
    division_technique: 'administratif',
    resp_biblio: 'administratif',
};

/** The 6 flat cards under "Direction & Services Rattachés" — no nesting. */
export const directionGrid = ['prmp', 'conseil_scientifique', 'college_enseignants', 'secretariat_direction', 'resp_qualite', 'resp_comm'];

/** Pôle Pédagogique — expandable tree rooted at coordo_pedagogique. */
export const pedagogicalPole = {
    key: 'coordo_pedagogique',
    children: [
        {
            key: 'mention_stnpa',
            children: [
                { key: 'parcours_gi', suffixKey: 'chef_de_parcours' },
                { key: 'parcours_gb', suffixKey: 'chef_de_parcours' },
                { key: 'parcours_gei', suffixKey: 'chef_de_parcours' },
            ],
        },
        {
            key: 'mention_sti',
            children: [
                { key: 'parcours_ge', suffixKey: 'chef_de_parcours' },
                { key: 'parcours_gind', suffixKey: 'chef_de_parcours' },
                { key: 'parcours_gt', suffixKey: 'chef_de_parcours' },
            ],
        },
        {
            key: 'mention_gc',
            children: [
                { key: 'parcours_gcivil', suffixKey: 'chef_de_parcours' },
                { key: 'parcours_ghyd', suffixKey: 'chef_de_parcours' },
                { key: 'parcours_garchi', suffixKey: 'chef_de_parcours' },
            ],
        },
        {
            key: 'service_cooperation',
            children: [{ key: 'division_coop' }, { key: 'division_labo' }, { key: 'division_relations' }],
        },
        {
            key: 'service_stats',
            children: [{ key: 'agent_affaires' }, { key: 'resp_stats_diplomes' }],
        },
    ],
};

/** Pôle Administratif — expandable tree rooted at secretaire_principal. */
export const administrativePole = {
    key: 'secretaire_principal',
    children: [
        { key: 'service_compta' },
        { key: 'service_numerique' },
        {
            key: 'service_scolarite',
            children: [{ key: 'secretariat_master' }, { key: 'secretariat_licence' }, { key: 'resp_diplomes' }],
        },
        {
            key: 'service_logistique',
            children: [{ key: 'division_logistique' }, { key: 'division_technique' }, { key: 'resp_biblio' }],
        },
    ],
};

export const cursusLadder = [
    { key: 'bacc', level: 'BACC Scientifique (Série C, D, A2 et Technique)', items: ['Sélection des dossiers'] },
    { key: 'l1l2', level: 'L1 et L2', items: ['Base des études supérieures + matières de base', "Examen (Test d'évaluation)"] },
    {
        key: 'l3',
        level: 'L3',
        items: ["Stage de fin d'étude de 3 mois minimum en entreprise, société ou hôpital", "Soutenance de mémoire de fin d'étude de formation"],
    },
    { key: 'm1', level: 'M1', items: ['Formation en tronc commun en S7 et S8', 'Formation par spécialité de chaque parcours'] },
    { key: 'm2', level: 'M2', items: ["Soutenance de mémoire de fin d'études de formation"] },
];
