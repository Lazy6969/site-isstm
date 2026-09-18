import { Head, Link, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import BiblioLayout from '../../Components/Bibliotheque/BiblioLayout';
import { useTranslations } from '../../lib/useTranslations';

export default function Recherche({ query, canevas, memoires }) {
    const { t } = useTranslations();
    const { data, setData, get, processing } = useForm({ q: query ?? '' });

    function submit(e) {
        e.preventDefault();
        get('/bibliotheque/recherche', { preserveState: true, preserveScroll: true });
    }

    return (
        <BiblioLayout title={t('nav.recherche', 'Recherche')}>
            <Head title="Recherche" />

            <form onSubmit={submit} className="mb-8 flex gap-2">
                <input
                    type="text"
                    value={data.q}
                    onChange={(e) => setData('q', e.target.value)}
                    placeholder={t('bibliotheque.placeholder_recherche', 'Rechercher un canevas, un mémoire, un auteur…')}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20"
                />
                <button disabled={processing} className="flex items-center gap-2 rounded-lg bg-isstm-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    <Search className="h-4 w-4" aria-hidden="true" />
                    {t('nav.rechercher', 'Rechercher')}
                </button>
            </form>

            {query && (
                <div className="grid gap-8 sm:grid-cols-2">
                    <section>
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                            {t('bibliotheque.canevas_titre', 'Canevas')} ({canevas.length})
                        </h2>
                        {canevas.length === 0 && <p className="text-sm text-slate-400">{t('recherche.aucun_resultat_simple', 'Aucun résultat.')}</p>}
                        <div className="space-y-2">
                            {canevas.map((c) => (
                                <a key={c.id} href={`/bibliotheque/canevas/${c.id}/telecharger`} className="block rounded-xl border border-slate-100 bg-white p-3 text-sm shadow-sm hover:border-isstm-navy/30">
                                    <span className="font-medium text-slate-700">{c.titre}</span>
                                    <span className="ml-2 text-xs text-slate-400">{c.niveau} · {c.annee}</span>
                                </a>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                            {t('bibliotheque.memoires_titre', 'Mémoires & projets')} ({memoires.length})
                        </h2>
                        {memoires.length === 0 && <p className="text-sm text-slate-400">{t('recherche.aucun_resultat_simple', 'Aucun résultat.')}</p>}
                        <div className="space-y-2">
                            {memoires.map((m) => (
                                <Link key={m.id} href={`/bibliotheque/memoires/${m.id}/consulter`} className="block rounded-xl border border-slate-100 bg-white p-3 text-sm shadow-sm hover:border-isstm-navy/30">
                                    <span className="font-medium text-slate-700">{m.titre}</span>
                                    <span className="ml-2 text-xs text-slate-400">{m.categorie} · {m.filiere} · {m.auteur}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </BiblioLayout>
    );
}
