import { Head, Link, useForm } from '@inertiajs/react';
import { Archive, KeySquare, Plus, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import GroupCard from '../../Components/Groupes/GroupCard';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ groups, canCreate }) {
    const { t } = useTranslations();
    const [showCreate, setShowCreate] = useState(false);
    const createForm = useForm({ name: '', type: 'classe', annee: '', filiere_id: '', niveau: '' });
    const joinForm = useForm({ code: '' });

    function submitCreate(e) {
        e.preventDefault();
        createForm.post('/groupes', { onSuccess: () => createForm.reset() });
    }

    function submitJoin(e) {
        e.preventDefault();
        joinForm.post('/groupes/rejoindre', { onSuccess: () => joinForm.reset() });
    }

    return (
        <AppLayout title={t('groupes.titre', 'Mes groupes')}>
            <Head title="Mes groupes" />

            <div className="mb-4 flex justify-end">
                <Link href="/groupes/archives" className="flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                    <Archive className="h-4 w-4" aria-hidden="true" />
                    {t('groupes.voir_archives', 'Groupes archivés')}
                </Link>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-isstm-navy dark:text-white">
                        <KeySquare className="h-4 w-4 text-isstm-gold" aria-hidden="true" />
                        {t('groupes.rejoindre_titre', 'Rejoindre un groupe')}
                    </h2>
                    <form onSubmit={submitJoin} className="flex gap-2">
                        <input
                            type="text"
                            value={joinForm.data.code}
                            onChange={(e) => joinForm.setData('code', e.target.value.toUpperCase())}
                            placeholder={t('groupes.code_groupe', 'Code du groupe')}
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm uppercase tracking-widest focus:border-isstm-navy focus:outline-none"
                        />
                        <button disabled={joinForm.processing} className="rounded-lg bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                            {t('groupes.rejoindre', 'Rejoindre')}
                        </button>
                    </form>
                    {joinForm.errors.code && <p className="mt-1 text-sm text-red-600">{joinForm.errors.code}</p>}
                </Card>

                {canCreate && (
                    <Card className="p-5">
                        <button onClick={() => setShowCreate((v) => !v)} className="flex items-center gap-1.5 text-sm font-semibold text-isstm-navy dark:text-white">
                            {showCreate ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                            {showCreate ? t('groupes.annuler', 'Annuler') : t('groupes.creer_titre', 'Créer un groupe de classe')}
                        </button>
                        {showCreate && (
                            <form onSubmit={submitCreate} className="mt-3 space-y-2">
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder={t('groupes.nom_placeholder', 'Nom du groupe (ex : L1 Informatique)')}
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={createForm.data.annee}
                                        onChange={(e) => createForm.setData('annee', e.target.value)}
                                        placeholder={t('groupes.annee_placeholder', 'Année (2026)')}
                                        className="w-1/2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={createForm.data.niveau}
                                        onChange={(e) => createForm.setData('niveau', e.target.value)}
                                        placeholder={t('groupes.niveau_placeholder', 'Niveau (L1)')}
                                        className="w-1/2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                    />
                                </div>
                                {createForm.errors.name && <p className="text-sm text-red-600">{createForm.errors.name}</p>}
                                <button disabled={createForm.processing} className="w-full rounded-lg bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                    {t('groupes.creer_cta', 'Créer le groupe')}
                                </button>
                            </form>
                        )}
                    </Card>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {groups.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-slate-400 dark:text-slate-500 sm:col-span-2">
                        {t(
                            'groupes.aucun_groupe',
                            "Vous n'êtes membre d'aucun groupe. Rejoignez-en un avec un code, ou créez le vôtre.",
                        )}
                    </p>
                )}
                {groups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                ))}
            </div>
        </AppLayout>
    );
}
