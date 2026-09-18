import { Head, router, useForm } from '@inertiajs/react';
import { Download, File, FileText, Presentation } from 'lucide-react';
import BiblioLayout from '../../../Components/Bibliotheque/BiblioLayout';
import { Card } from '../../../Components/ui/card';
import { useTranslations } from '../../../lib/useTranslations';

const fileIcons = { word: FileText, pdf: File, pptx: Presentation };

export default function Index({ canevas, niveaux, annees, filters }) {
    const { t } = useTranslations();
    const { data, setData } = useForm({ niveau: filters.niveau ?? '', annee_id: filters.annee_id ?? '' });

    function applyFilters(next) {
        const merged = { ...data, ...next };
        setData(merged);
        router.get('/bibliotheque/canevas', merged, { preserveState: true, preserveScroll: true });
    }

    return (
        <BiblioLayout title={t('bibliotheque.canevas_titre', 'Canevas de mémoire')}>
            <Head title="Canevas" />

            <div className="mb-6 flex flex-wrap gap-3">
                <select
                    value={data.niveau}
                    onChange={(e) => applyFilters({ niveau: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                >
                    <option value="">{t('bibliotheque.tous_niveaux', 'Tous les niveaux')}</option>
                    {niveaux.map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <select
                    value={data.annee_id}
                    onChange={(e) => applyFilters({ annee_id: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                >
                    <option value="">{t('bibliotheque.toutes_annees', 'Toutes les années')}</option>
                    {annees.map((a) => (
                        <option key={a.id} value={a.id}>{a.libelle}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                {canevas.length === 0 && (
                    <Card className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                        {t('bibliotheque.aucun_canevas_filtre', 'Aucun canevas ne correspond à ces filtres.')}
                    </Card>
                )}
                {canevas.map((c) => {
                    const Icon = fileIcons[c.type_fichier] ?? File;
                    return (
                        <Card key={c.id} className="flex items-center gap-3 p-4">
                            <Icon className="h-6 w-6 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-slate-700 dark:text-slate-200">{c.titre}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{c.niveau} · {c.annee}</p>
                            </div>
                            <a
                                href={`/bibliotheque/canevas/${c.id}/telecharger`}
                                className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-isstm-navy-dark"
                            >
                                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('documents.telecharger', 'Télécharger')}
                            </a>
                        </Card>
                    );
                })}
            </div>
        </BiblioLayout>
    );
}
