import { Head, usePage } from '@inertiajs/react';
import { Award, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import EditableText from '../../Components/QuickEdit/EditableText';
import BannerBackground from '../../Components/QuickEdit/BannerBackground';
import { useTranslations } from '../../lib/useTranslations';

/** One filter pill — same shape as Enseignants/Index.jsx's own FilterPill. */
function FilterPill({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
                active
                    ? 'bg-isstm-navy text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-isstm-navy/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
        >
            {children}
        </button>
    );
}

/**
 * Public "Résultats" page (Établissement dropdown) — every admitted
 * candidate an admin has published, from Admin\ResultatAdmissionController.
 * Niveau filter and name search both run client-side: the list fetched once
 * from the server is already everything there is to show (see
 * ResultatController's docblock).
 */
export default function Index({ resultats }) {
    const { t } = useTranslations();
    const { content } = usePage().props;
    const [niveau, setNiveau] = useState('all');
    const [query, setQuery] = useState('');

    const niveaux = useMemo(
        () => Array.from(new Set(resultats.map((r) => r.niveau).filter(Boolean))),
        [resultats],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return resultats
            .filter((r) => niveau === 'all' || r.niveau === niveau)
            .filter((r) => q === '' || `${r.nom} ${r.prenoms ?? ''}`.toLowerCase().includes(q));
    }, [resultats, niveau, query]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Résultats" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="resultats_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-6xl px-6">
                    <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                        <Award className="h-6 w-6 text-isstm-gold" aria-hidden="true" />
                        <EditableText as="span" contentKey="resultats_titre">
                            {content.resultats_titre ?? t('resultats.titre', "Résultats d'admission")}
                        </EditableText>
                    </h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        <EditableText as="span" contentKey="resultats_soustitre">
                            {content.resultats_soustitre ?? t('resultats.soustitre', "La liste des candidats admis à l'ISSTM.")}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-8 flex flex-wrap items-center gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pb-2">
                    <FilterPill active={niveau === 'all'} onClick={() => setNiveau('all')}>
                        {t('resultats.tous_niveaux', 'Tous les niveaux')}
                    </FilterPill>
                    {niveaux.map((value) => (
                        <FilterPill key={value} active={niveau === value} onClick={() => setNiveau(value)}>
                            {value}
                        </FilterPill>
                    ))}

                    <div className="relative ml-auto w-full sm:w-64">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('resultats.rechercher', 'Rechercher un nom...')}
                            className="w-full rounded-full border border-slate-200 bg-white py-2 pr-4 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-isstm-gold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <>
                        <p className="mb-5 text-center text-base font-semibold text-emerald-600 dark:text-emerald-400">
                            {t('resultats.felicitations', 'Félicitations aux admis !')}
                        </p>
                        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_6px_24px_-12px_rgba(15,23,42,0.25)] dark:bg-slate-800">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-900/40 dark:text-slate-400">
                                    <tr>
                                        <th className="px-5 py-3">{t('resultats.colonne_nom', 'Nom et prénom(s)')}</th>
                                        <th className="px-5 py-3">{t('resultats.colonne_niveau', 'Niveau')}</th>
                                        <th className="px-5 py-3">{t('resultats.colonne_filiere', 'Filière')}</th>
                                        <th className="px-5 py-3">{t('resultats.colonne_annee', 'Année')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filtered.map((resultat) => (
                                        <tr key={resultat.id}>
                                            <td className="px-5 py-3 font-semibold text-isstm-navy dark:text-white">
                                                {resultat.nom} {resultat.prenoms}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{resultat.niveau ?? '—'}</td>
                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{resultat.filiere?.nom_fr ?? '—'}</td>
                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                                                {resultat.date ? new Date(resultat.date).getFullYear() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400">
                        {t('resultats.aucun_resultat', 'Aucun résultat ne correspond à votre recherche.')}
                    </p>
                )}
            </main>

            <Footer />
        </div>
    );
}
