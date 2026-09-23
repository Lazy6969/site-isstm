import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import { Card } from '../Components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../Components/ui/avatar';
import { useTranslations } from '../lib/useTranslations';
import EditableText from '../Components/QuickEdit/EditableText';
import EditableImage from '../Components/QuickEdit/EditableImage';
import { imageStyleToBackgroundCss, imageStyleToCss } from '../lib/imageStyle';

const identityCard = [
    {
        key: 'associations_identite_regime',
        labelKey: 'associations_identite_regime_label',
        label: 'Régime juridique',
        value: 'Association à but non lucratif — Ordonnance n°60-133 du 03/10/1960',
    },
    {
        key: 'associations_identite_siege',
        labelKey: 'associations_identite_siege_label',
        label: 'Siège social',
        value: 'ISSTM, Majunga Be, Commune Urbaine Mahajanga-I',
    },
    {
        key: 'associations_identite_duree',
        labelKey: 'associations_identite_duree_label',
        label: 'Durée',
        value: 'Illimitée',
    },
    {
        key: 'associations_identite_but',
        labelKey: 'associations_identite_but_label',
        label: 'But',
        value: "Rassembler et unir tous les étudiants de l'ISSTM",
    },
];

const bureauRoles = [
    {
        key: 'associations_bureau_role1',
        role: 'Président',
        count: 1,
        critere:
            "Seuls les niveaux L2 et M1 peuvent être élus Président de l'A.E.I.",
    },
    {
        key: 'associations_bureau_role2',
        role: 'Vice-Président',
        count: 1,
        critere:
            'Désigné par le Président ; aucune restriction de niveau, sauf L1.',
    },
    {
        key: 'associations_bureau_role3',
        role: 'Secrétaire Général',
        count: 1,
        critere:
            "Doit être un des candidats non-élus lors de l'élection du Président.",
    },
    {
        key: 'associations_bureau_role4',
        role: 'Trésorier',
        count: 1,
        critere:
            'Désigné par les autres membres du bureau et les chefs de classe.',
    },
    {
        key: 'associations_bureau_role5',
        role: 'Commissaire aux Comptes',
        count: 5,
        critere:
            'Chaque niveau (L1, L2, L3, M1, M2) envoie un représentant.',
    },
    {
        key: 'associations_bureau_role6',
        role: 'Conseillers',
        count: 4,
        critere:
            "Chaque mention désigne un représentant ; l'ex-Président en fait partie.",
    },
];

const bureauFondateur = [
    { key: 'associations_fondateur_1', role: 'Président', nom: 'NOMENJANAHARY Narcisse Isidore' },
    { key: 'associations_fondateur_2', role: 'Vice-président', nom: 'RAKOTOARIVELO Vannyaud Bruno' },
    {
        key: 'associations_fondateur_3',
        role: 'Secrétaire Générale',
        nom: 'HARENANTENAINA Florentinoh Jobela Adelin',
    },
    { key: 'associations_fondateur_4', role: 'Trésorier', nom: 'RATSIMALAIMANANA Mamy Nirina' },
    {
        key: 'associations_fondateur_5',
        role: 'Commissaire au compte',
        nom: 'RANDRIANARIMALALA Jean Leonard',
    },
    {
        key: 'associations_fondateur_6',
        role: 'Commissaire au compte',
        nom: 'RABARIVELOMANANA Maxwell Ny Aina',
    },
    { key: 'associations_fondateur_7', role: 'Commissaire au compte', nom: 'RAZAFINDRAFITA Zagarino' },
    {
        key: 'associations_fondateur_8',
        role: 'Commissaire au compte',
        nom: 'RANDRIANAIVOSOLO Aina Daniel',
    },
    { key: 'associations_fondateur_9', role: 'Commissaire au compte', nom: 'ADIALHAM Tonganjara' },
    {
        key: 'associations_fondateur_10',
        role: 'Conseiller',
        nom: 'RABOTOVAO Harimboahangitiana Kanto',
    },
    { key: 'associations_fondateur_11', role: 'Conseiller', nom: 'RANDRIAMANTENA Judicaël' },
    { key: 'associations_fondateur_12', role: 'Conseiller', nom: 'FIDERANA Nardah Mamelphina' },
    { key: 'associations_fondateur_13', role: 'Conseiller', nom: 'FREDERIC Moise' },
];

const gallery = [
    { key: 'associations_galerie_1', image: 'images/portal_assoc_4.jpg' },
    { key: 'associations_galerie_2', image: 'images/portal_assoc_5.jpg' },
    { key: 'associations_galerie_3', image: 'images/portal_assoc_6.jpg' },
];

export default function Associations() {
    const { t } = useTranslations();
    const { content, contentStyles } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Clubs et Associations" />

            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <Link
                        href="/vie-etudiante"
                        className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:underline"
                    >
                        <ArrowLeft
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                        {t('nav.vie_etudiante', 'Vie étudiante')}
                    </Link>

                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="associations_titre">
                            {content.associations_titre}
                        </EditableText>
                    </h1>

                    <p className="mt-2 text-white/80">
                        <EditableText as="span" contentKey="associations_soustitre">
                            {content.associations_soustitre}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-12 px-6 py-12">
                <div className="relative flex justify-center">
                    <Avatar className="h-20 w-20 ring-4 ring-isstm-gold/30">
                        <AvatarImage
                            src={`/${content.associations_logo ?? 'images/aei.jpeg'}`}
                            alt="Logo AEI"
                            style={imageStyleToCss(contentStyles?.associations_logo)}
                        />
                        <AvatarFallback>AEI</AvatarFallback>
                    </Avatar>
                    <EditableImage
                        contentKey="associations_logo"
                        value={content.associations_logo ?? 'images/aei.jpeg'}
                        className="absolute right-[calc(50%-2.5rem)] top-0 z-10"
                    />
                </div>

                <Card className="p-7">
                    <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">
                        <EditableText as="span" contentKey="associations_identite_titre">
                            {content.associations_identite_titre}
                        </EditableText>
                    </h2>

                    <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {identityCard.map((item) => (
                            <div key={item.key}>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    <EditableText as="span" contentKey={item.labelKey}>
                                        {content[item.labelKey] ?? item.label}
                                    </EditableText>
                                </dt>

                                <EditableText
                                    as="dd"
                                    contentKey={item.key}
                                    className="mt-1 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    {content[item.key] ?? item.value}
                                </EditableText>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-700">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            <EditableText as="span" contentKey="associations_membres_honneur_label">
                                {content.associations_membres_honneur_label}
                            </EditableText>
                        </dt>

                        <dd className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                            <EditableText as="span" contentKey="associations_membres_honneur_valeur">
                                {content.associations_membres_honneur_valeur}
                            </EditableText>
                        </dd>
                    </div>
                </Card>

                <section>
                    <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">
                        <EditableText as="span" contentKey="associations_bureau_titre">
                            {content.associations_bureau_titre}
                        </EditableText>
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <EditableText as="span" contentKey="associations_bureau_article">
                            {content.associations_bureau_article}
                        </EditableText>
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {bureauRoles.map((item) => (
                            <Card key={item.key} className="p-5">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="font-semibold text-isstm-navy dark:text-white">
                                        <EditableText as="span" contentKey={`${item.key}_role`}>
                                            {content[`${item.key}_role`] ?? item.role}
                                        </EditableText>
                                    </h3>

                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                        ×{' '}
                                        <EditableText as="span" contentKey={`${item.key}_count`}>
                                            {content[`${item.key}_count`] ?? String(item.count)}
                                        </EditableText>
                                    </span>
                                </div>

                                <EditableText
                                    as="p"
                                    contentKey={`${item.key}_critere`}
                                    className="mt-1.5 text-sm text-slate-500 dark:text-slate-400"
                                >
                                    {content[`${item.key}_critere`] ??
                                        item.critere}
                                </EditableText>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">
                        <EditableText as="span" contentKey="associations_fondateur_titre">
                            {content.associations_fondateur_titre}
                        </EditableText>
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <EditableText as="span" contentKey="associations_fondateur_date">
                            {content.associations_fondateur_date}
                        </EditableText>
                    </p>

                    <Card className="mt-5 overflow-hidden">
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {bureauFondateur.map((membre) => (
                                <li
                                    key={membre.key}
                                    className="flex items-center justify-between px-5 py-3 text-sm"
                                >
                                    <span className="text-slate-500 dark:text-slate-400">
                                        <EditableText as="span" contentKey={`${membre.key}_role`}>
                                            {content[`${membre.key}_role`] ?? membre.role}
                                        </EditableText>
                                    </span>

                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                        <EditableText as="span" contentKey={`${membre.key}_nom`}>
                                            {content[`${membre.key}_nom`] ?? membre.nom}
                                        </EditableText>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>

                <section className="grid grid-cols-3 gap-2">
                    {gallery.map((item) => {
                        const image = content[item.key] ?? item.image;
                        return (
                            <div key={item.key} className="relative">
                                <div
                                    className="h-32 rounded-xl bg-cover bg-center sm:h-44"
                                    style={{
                                        backgroundImage: `url('/${image}')`,
                                        ...imageStyleToBackgroundCss(contentStyles?.[item.key]),
                                    }}
                                />
                                <EditableImage contentKey={item.key} value={image} />
                            </div>
                        );
                    })}
                </section>
            </main>

            <Footer />
        </div>
    );
}