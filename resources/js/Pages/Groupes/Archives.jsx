import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArchiveRestore } from 'lucide-react';
import AppLayout from '../../Components/Layout/AppLayout';
import GroupCard from '../../Components/Groupes/GroupCard';
import { useTranslations } from '../../lib/useTranslations';

export default function Archives({ groups }) {
    const { t } = useTranslations();

    function unarchive(groupId) {
        router.post(`/groupes/${groupId}/archiver`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout title={t('groupes.archives_titre', 'Groupes archivés')}>
            <Head title="Groupes archivés" />

            <Link href="/groupes" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('groupes.retour_mes_groupes', 'Retour à mes groupes')}
            </Link>

            <div className="grid gap-3 sm:grid-cols-2">
                {groups.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-slate-400 dark:text-slate-500 sm:col-span-2">
                        {t('groupes.aucun_groupe_archive', 'Aucun groupe archivé.')}
                    </p>
                )}
                {groups.map((group) => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        action={
                            group.can_moderate && (
                                <button
                                    onClick={() => unarchive(group.id)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-isstm-navy hover:underline dark:text-white"
                                >
                                    <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
                                    {t('groupes.desarchiver', 'Désarchiver')}
                                </button>
                            )
                        }
                    />
                ))}
            </div>
        </AppLayout>
    );
}
