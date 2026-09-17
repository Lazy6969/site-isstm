import { Head, router, useForm } from '@inertiajs/react';
import BiblioLayout from '../../../Components/Bibliotheque/BiblioLayout';

const fileIcons = { word: '📝', pdf: '📕', pptx: '📊' };

export default function Index({ canevas, niveaux, annees, filters }) {
    const { data, setData } = useForm({ niveau: filters.niveau ?? '', annee_id: filters.annee_id ?? '' });

    function applyFilters(next) {
        const merged = { ...data, ...next };
        setData(merged);
        router.get('/bibliotheque/canevas', merged, { preserveState: true, preserveScroll: true });
    }

    return (
        <BiblioLayout title="Canevas de mémoire">
            <Head title="Canevas" />

            <div className="mb-6 flex flex-wrap gap-3">
                <select
                    value={data.niveau}
                    onChange={(e) => applyFilters({ niveau: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                >
                    <option value="">Tous les niveaux</option>
                    {niveaux.map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <select
                    value={data.annee_id}
                    onChange={(e) => applyFilters({ annee_id: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                >
                    <option value="">Toutes les années</option>
                    {annees.map((a) => (
                        <option key={a.id} value={a.id}>{a.libelle}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                {canevas.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                        Aucun canevas ne correspond à ces filtres.
                    </p>
                )}
                {canevas.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <span className="text-2xl">{fileIcons[c.type_fichier] ?? '📄'}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-700">{c.titre}</p>
                            <p className="text-xs text-slate-400">{c.niveau} · {c.annee}</p>
                        </div>
                        <a
                            href={`/bibliotheque/canevas/${c.id}/telecharger`}
                            className="rounded-full bg-isstm-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-isstm-navy-dark"
                        >
                            Télécharger
                        </a>
                    </div>
                ))}
            </div>
        </BiblioLayout>
    );
}
