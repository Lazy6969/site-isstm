import { Head, Link, router, useForm } from '@inertiajs/react';
import BiblioLayout from '../../../Components/Bibliotheque/BiblioLayout';
import { Card } from '../../../Components/ui/card';
import { Badge } from '../../../Components/ui/badge';
import { useTranslations } from '../../../lib/useTranslations';

export default function Index({ memoires, categories, filieresList, annees, filters }) {
    const { t } = useTranslations();
    const { data, setData } = useForm({
        categorie: filters.categorie ?? '',
        filiere_id: filters.filiere_id ?? '',
        annee_id: filters.annee_id ?? '',
    });

    function applyFilters(next) {
        const merged = { ...data, ...next };
        setData(merged);
        router.get('/bibliotheque/memoires', merged, { preserveState: true, preserveScroll: true });
    }

    return (
        <BiblioLayout title={t('bibliotheque.memoires_titre', 'Mémoires & projets')}>
            <Head title="Mémoires & projets" />

            <div className="mb-6 flex flex-wrap gap-3">
                <select
                    value={data.categorie}
                    onChange={(e) => applyFilters({ categorie: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                >
                    <option value="">{t('bibliotheque.toutes_categories', 'Toutes les catégories')}</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    value={data.filiere_id}
                    onChange={(e) => applyFilters({ filiere_id: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                >
                    <option value="">{t('bibliotheque.toutes_filieres', 'Toutes les filières')}</option>
                    {filieresList.map((f) => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                </select>
                <select
                    value={data.annee_id}
                    onChange={(e) => applyFilters({ annee_id: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                >
                    <option value="">{t('bibliotheque.toutes_annees', 'Toutes les années')}</option>
                    {annees.map((a) => (
                        <option key={a.id} value={a.id}>{a.libelle}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                {memoires.length === 0 && (
                    <Card className="p-8 text-center text-sm text-slate-400">
                        {t('bibliotheque.aucun_memoire_filtre', 'Aucun document ne correspond à ces filtres.')}
                    </Card>
                )}
                {memoires.map((m) => (
                    <Link key={m.id} href={`/bibliotheque/memoires/${m.id}/consulter`} className="block">
                        <Card className="p-4 transition hover:border-isstm-navy/30">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-slate-700">{m.titre}</p>
                                    <p className="text-xs text-slate-400">
                                        {m.auteur} · {m.filiere} ({m.niveau}) · {m.mention} · {m.annee}
                                    </p>
                                </div>
                                <Badge className="flex-shrink-0">{m.categorie}</Badge>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </BiblioLayout>
    );
}
