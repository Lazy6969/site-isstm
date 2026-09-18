import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import { Card } from '../Components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../Components/ui/avatar';
import { useTranslations } from '../lib/useTranslations';

const identityCard = [
    { label: 'Régime juridique', value: 'Association à but non lucratif — Ordonnance n°60-133 du 03/10/1960' },
    { label: 'Siège social', value: 'ISSTM, Majunga Be, Commune Urbaine Mahajanga-I' },
    { label: 'Durée', value: 'Illimitée' },
    { label: 'But', value: 'Rassembler et unir tous les étudiants de l\'ISSTM' },
];

const bureauRoles = [
    { role: 'Président', count: 1, critere: "Seuls les niveaux L2 et M1 peuvent être élus Président de l'A.E.I." },
    { role: 'Vice-Président', count: 1, critere: 'Désigné par le Président ; aucune restriction de niveau, sauf L1.' },
    { role: 'Secrétaire Général', count: 1, critere: "Doit être un des candidats non-élus lors de l'élection du Président." },
    { role: 'Trésorier', count: 1, critere: 'Désigné par les autres membres du bureau et les chefs de classe.' },
    { role: 'Commissaire aux Comptes', count: 5, critere: 'Chaque niveau (L1, L2, L3, M1, M2) envoie un représentant.' },
    { role: 'Conseillers', count: 4, critere: "Chaque mention désigne un représentant ; l'ex-Président en fait partie." },
];

const bureauFondateur = [
    { role: 'Président', nom: 'NOMENJANAHARY Narcisse Isidore' },
    { role: 'Vice-président', nom: 'RAKOTOARIVELO Vannyaud Bruno' },
    { role: 'Secrétaire Générale', nom: 'HARENANTENAINA Florentinoh Jobela Adelin' },
    { role: 'Trésorier', nom: 'RATSIMALAIMANANA Mamy Nirina' },
    { role: 'Commissaire au compte', nom: 'RANDRIANARIMALALA Jean Leonard' },
    { role: 'Commissaire au compte', nom: 'RABARIVELOMANANA Maxwell Ny Aina' },
    { role: 'Commissaire au compte', nom: 'RAZAFINDRAFITA Zagarino' },
    { role: 'Commissaire au compte', nom: 'RANDRIANAIVOSOLO Aina Daniel' },
    { role: 'Commissaire au compte', nom: 'ADIALHAM Tonganjara' },
    { role: 'Conseiller', nom: 'RABOTOVAO Harimboahangitiana Kanto' },
    { role: 'Conseiller', nom: 'RANDRIAMANTENA Judicaël' },
    { role: 'Conseiller', nom: 'FIDERANA Nardah Mamelphina' },
    { role: 'Conseiller', nom: 'FREDERIC Moise' },
];

const gallery = ['images/portal_assoc_4.jpg', 'images/portal_assoc_5.jpg', 'images/portal_assoc_6.jpg'];

export default function Associations() {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Clubs et Associations" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <Link href="/vie-etudiante" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:underline">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('nav.vie_etudiante', 'Vie étudiante')}
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold">{t('associations.titre', 'Clubs et Associations')}</h1>
                    <p className="mt-2 text-white/80">
                        {t(
                            'associations.soustitre',
                            "Découvrez les statuts et le fonctionnement de l'Association des Étudiants de l'ISSTM (A.E.I).",
                        )}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-12 px-6 py-12">
                <div className="flex justify-center">
                    <Avatar className="h-20 w-20 ring-4 ring-isstm-gold/30">
                        <AvatarImage src="/images/aei.jpeg" alt="Logo AEI" />
                        <AvatarFallback>AEI</AvatarFallback>
                    </Avatar>
                </div>

                <Card className="p-7">
                    <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">{t('associations.identite_titre', "Carte d'Identité de l'Association")}</h2>
                    <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {identityCard.map((item) => (
                            <div key={item.label}>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{item.label}</dt>
                                <dd className="mt-1 text-sm text-slate-700 dark:text-slate-200">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-5 border-t border-slate-100 dark:border-slate-700 pt-5">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{t('associations.membres_honneur', "Membres d'honneur")}</dt>
                        <dd className="mt-1 text-sm text-slate-700 dark:text-slate-200">Directeur et Directeur Adjoint de l'ISSTM</dd>
                    </div>
                </Card>

                <section>
                    <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">{t('associations.bureau_titre', 'Composition du Bureau Exécutif')}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('associations.bureau_article', 'Article 13 des statuts')}</p>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {bureauRoles.map((item) => (
                            <Card key={item.role} className="p-5">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="font-semibold text-isstm-navy dark:text-white">{item.role}</h3>
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">× {item.count}</span>
                                </div>
                                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{item.critere}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">{t('associations.fondateur_titre', 'Bureau fondateur')}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('associations.fondateur_date', 'Élu lors du procès-verbal du 10 mai 2022')}</p>
                    <Card className="mt-5 overflow-hidden">
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {bureauFondateur.map((membre, index) => (
                                <li key={index} className="flex items-center justify-between px-5 py-3 text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">{membre.role}</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{membre.nom}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>

                <section className="grid grid-cols-3 gap-2">
                    {gallery.map((image) => (
                        <div key={image} className="h-32 rounded-xl bg-cover bg-center sm:h-44" style={{ backgroundImage: `url('/${image}')` }} />
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    );
}
