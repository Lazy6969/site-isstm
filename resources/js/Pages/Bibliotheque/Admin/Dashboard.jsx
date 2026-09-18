import { Head } from '@inertiajs/react';
import BiblioAdminLayout from '../../../Components/Bibliotheque/BiblioAdminLayout';
import { Card } from '../../../Components/ui/card';
import { useTranslations } from '../../../lib/useTranslations';

export default function Dashboard({ stats }) {
    const { t } = useTranslations();

    const tiles = [
        { label: t('bibliotheque.canevas_titre', 'Canevas'), value: stats.canevas },
        { label: t('bibliotheque_admin.memoires', 'Mémoires'), value: stats.memoires },
        { label: t('bibliotheque_admin.projets', 'Projets'), value: stats.projets },
        { label: t('bibliotheque_admin.filieres_referencees', 'Filières référencées'), value: stats.filieres },
    ];

    return (
        <BiblioAdminLayout title={t('bibliotheque_admin.dashboard_titre', 'Tableau de bord — Bibliothèque')}>
            <Head title="Bibliothèque — Tableau de bord" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tiles.map((tile) => (
                    <Card key={tile.label} className="p-5">
                        <p className="text-3xl font-bold text-isstm-navy dark:text-white">{tile.value}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tile.label}</p>
                    </Card>
                ))}
            </div>
        </BiblioAdminLayout>
    );
}
