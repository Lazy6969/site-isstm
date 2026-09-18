import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileStack } from 'lucide-react';
import BiblioLayout from '../../Components/Bibliotheque/BiblioLayout';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ derniersCanevas, derniersMemoires }) {
    const { t } = useTranslations();

    return (
        <BiblioLayout title={t('bibliotheque.titre', 'Bibliothèque numérique')}>
            <Head title="Bibliothèque numérique" />

            <p className="mb-8 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                {t(
                    'bibliotheque.soustitre',
                    "Canevas de mémoire officiels, mémoires et projets d'anciens étudiants consultables en ligne, et recherche sur l'ensemble du fonds documentaire de l'ISSTM.",
                )}
            </p>

            <div className="mb-10 grid gap-4 sm:grid-cols-2">
                <Link href="/bibliotheque/canevas" className="block">
                    <Card className="p-6 transition hover:border-isstm-navy/30 hover:shadow-md">
                        <h2 className="flex items-center gap-2 font-semibold text-isstm-navy dark:text-white">
                            <FileStack className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                            {t('bibliotheque.canevas_titre', 'Canevas de mémoire')}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {t('bibliotheque.canevas_desc', 'Modèles officiels Licence et Master, téléchargeables librement.')}
                        </p>
                    </Card>
                </Link>
                <Link href="/bibliotheque/memoires" className="block">
                    <Card className="p-6 transition hover:border-isstm-navy/30 hover:shadow-md">
                        <h2 className="flex items-center gap-2 font-semibold text-isstm-navy dark:text-white">
                            <BookOpen className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                            {t('bibliotheque.memoires_titre', 'Mémoires & projets')}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {t('bibliotheque.memoires_desc', "Travaux d'anciens étudiants, consultables en ligne uniquement.")}
                        </p>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
                <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {t('bibliotheque.derniers_canevas', 'Derniers canevas ajoutés')}
                    </h2>
                    <div className="space-y-2">
                        {derniersCanevas.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">{t('bibliotheque.aucun_canevas', 'Aucun canevas pour le moment.')}</p>}
                        {derniersCanevas.map((c) => (
                            <Link key={c.id} href="/bibliotheque/canevas" className="block rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm shadow-sm hover:border-isstm-navy/30">
                                <span className="font-medium text-slate-700 dark:text-slate-200">{c.titre}</span>
                                <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{c.niveau} · {c.annee}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {t('bibliotheque.derniers_memoires', 'Derniers mémoires & projets')}
                    </h2>
                    <div className="space-y-2">
                        {derniersMemoires.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">{t('bibliotheque.aucun_memoire', 'Aucun mémoire pour le moment.')}</p>}
                        {derniersMemoires.map((m) => (
                            <Link key={m.id} href={`/bibliotheque/memoires/${m.id}/consulter`} className="block rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm shadow-sm hover:border-isstm-navy/30">
                                <span className="font-medium text-slate-700 dark:text-slate-200">{m.titre}</span>
                                <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{m.categorie} · {m.filiere} · {m.auteur}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </BiblioLayout>
    );
}
