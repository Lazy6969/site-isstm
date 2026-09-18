import { Head, Link, useForm } from '@inertiajs/react';
import { KeySquare, Plus, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
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

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-isstm-navy">
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
                        <button onClick={() => setShowCreate((v) => !v)} className="flex items-center gap-1.5 text-sm font-semibold text-isstm-navy">
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
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 sm:col-span-2">
                        {t(
                            'groupes.aucun_groupe',
                            "Vous n'êtes membre d'aucun groupe. Rejoignez-en un avec un code, ou créez-en un si vous êtes enseignant.",
                        )}
                    </p>
                )}
                {groups.map((group) => (
                    <Link key={group.id} href={`/groupes/${group.id}`} className="block">
                        <Card className="p-5 transition hover:border-isstm-navy/30 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{group.name}</h3>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {[group.filiere, group.niveau, group.annee].filter(Boolean).join(' · ') || group.type_label}
                                    </p>
                                </div>
                                {group.unread_count > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-isstm-gold px-1.5 text-[11px] font-bold text-white">
                                        {group.unread_count}
                                    </span>
                                )}
                            </div>
                            <p className="mt-3 text-xs text-slate-400">
                                {t('groupes.enseignant', 'Enseignant :')} {group.teacher_name}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                {group.is_delegate && <Badge variant="gold">{t('groupes.delegue', 'Délégué')}</Badge>}
                                {group.join_code && (
                                    <Badge>
                                        {t('groupes.code', 'Code :')} {group.join_code}
                                    </Badge>
                                )}
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}
