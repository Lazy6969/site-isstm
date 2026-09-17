import { Head } from '@inertiajs/react';
import BiblioAdminLayout from '../../../Components/Bibliotheque/BiblioAdminLayout';

export default function Dashboard({ stats }) {
    const tiles = [
        { label: 'Canevas', value: stats.canevas },
        { label: 'Mémoires', value: stats.memoires },
        { label: 'Projets', value: stats.projets },
        { label: 'Filières référencées', value: stats.filieres },
    ];

    return (
        <BiblioAdminLayout title="Tableau de bord — Bibliothèque">
            <Head title="Bibliothèque — Tableau de bord" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tiles.map((t) => (
                    <div key={t.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <p className="text-3xl font-bold text-isstm-navy">{t.value}</p>
                        <p className="mt-1 text-sm text-slate-500">{t.label}</p>
                    </div>
                ))}
            </div>
        </BiblioAdminLayout>
    );
}
