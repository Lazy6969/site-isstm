import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { History, Search } from 'lucide-react';
import MaterielLayout from '../../../Components/Materiel/MaterielLayout';
import { EmptyState, PageHero } from '../../../Components/Materiel/kit';
import { MOUVEMENT_STYLES } from '../../../lib/materiel';
import { cn } from '../../../lib/utils';

const dayLabel = (value) => new Date(value).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeLabel = (value) => new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export default function Index({ mouvements, types }) {
    const [type, setType] = useState('');
    const [search, setSearch] = useState('');

    const term = search.trim().toLowerCase();
    const filtered = useMemo(
        () =>
            mouvements.filter((mouvement) => {
                if (type && mouvement.type !== type) return false;
                if (!term) return true;

                return `${mouvement.materiel.nom} ${mouvement.materiel.code} ${mouvement.de ?? ''} ${mouvement.vers ?? ''} ${mouvement.note ?? ''} ${mouvement.user ?? ''}`.toLowerCase().includes(term);
            }),
        [mouvements, type, term],
    );

    const groups = useMemo(() => {
        const byDay = new Map();
        filtered.forEach((mouvement) => {
            const key = mouvement.created_at.slice(0, 10);
            byDay.set(key, [...(byDay.get(key) ?? []), mouvement]);
        });

        return [...byDay.entries()];
    }, [filtered]);

    return (
        <MaterielLayout title="Historique">
            <PageHero icon={History} title="Historique des mouvements" subtitle="Chaque ajout, déplacement, prêt, retour, panne et réparation, avec la personne qui l’a enregistré." />

            <div className="mb-4 space-y-3">
                <div className="relative max-w-md">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Matériel, lieu, personne, note…" className="h-10 w-full rounded-full border border-admin-border bg-admin-card pl-10 pr-4 text-sm text-admin-text outline-none transition focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                    <button type="button" onClick={() => setType('')} aria-pressed={type === ''} className={cn('flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition', type === '' ? 'bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25' : 'border border-admin-border bg-admin-card text-admin-text-secondary hover:bg-admin-hover')}>
                        Tous
                    </button>
                    {Object.entries(types).map(([value, label]) => (
                        <button key={value} type="button" onClick={() => setType(type === value ? '' : value)} aria-pressed={type === value} className={cn('flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition', type === value ? 'bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25' : 'border border-admin-border bg-admin-card text-admin-text-secondary hover:bg-admin-hover')}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {groups.length === 0 ? (
                <EmptyState icon={History} title="Aucun mouvement" hint="L’historique se remplit au fil des actions sur le matériel." />
            ) : (
                <div className="space-y-6">
                    {groups.map(([day, items]) => (
                        <section key={day}>
                            <h2 className="mb-3 text-xs font-bold uppercase capitalize tracking-wider text-admin-text-secondary">{dayLabel(day)}</h2>
                            <ol className="relative space-y-2.5 border-l-2 border-admin-border pl-6">
                                {items.map((mouvement) => (
                                    <li key={mouvement.id} className="relative">
                                        <span className={cn('absolute -left-[37px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-admin-bg', MOUVEMENT_STYLES[mouvement.type])}>
                                            <span className="h-2 w-2 rounded-full bg-current" />
                                        </span>
                                        <div className="flex flex-col gap-1 rounded-2xl border border-admin-border bg-admin-card p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-admin-text">
                                                    {mouvement.label} ·{' '}
                                                    <Link href={`/materiel/inventaire/${mouvement.materiel.id}`} className="font-semibold text-admin-accent hover:underline">
                                                        {mouvement.materiel.nom}
                                                    </Link>{' '}
                                                    <span className="font-mono text-[11px] font-medium text-admin-muted">{mouvement.materiel.code}</span>
                                                </p>
                                                {(mouvement.de || mouvement.vers) && (
                                                    <p className="text-xs text-admin-text-secondary">
                                                        {mouvement.de ?? '—'} <span className="mx-1 text-admin-accent">→</span> {mouvement.vers ?? '—'}
                                                    </p>
                                                )}
                                                {mouvement.note && <p className="text-xs text-admin-muted">{mouvement.note}</p>}
                                            </div>
                                            <p className="flex-shrink-0 text-[11px] text-admin-muted">
                                                {timeLabel(mouvement.created_at)}
                                                {mouvement.user ? ` · ${mouvement.user}` : ''}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    ))}
                </div>
            )}
        </MaterielLayout>
    );
}
