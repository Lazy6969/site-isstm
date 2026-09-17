import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';

export default function Index({ groups, canCreate }) {
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
        <AppLayout title="Mes groupes">
            <Head title="Mes groupes" />

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <form onSubmit={submitJoin} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy">Rejoindre un groupe</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={joinForm.data.code}
                            onChange={(e) => joinForm.setData('code', e.target.value.toUpperCase())}
                            placeholder="Code du groupe"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm uppercase tracking-widest focus:border-isstm-navy focus:outline-none"
                        />
                        <button disabled={joinForm.processing} className="rounded-lg bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                            Rejoindre
                        </button>
                    </div>
                    {joinForm.errors.code && <p className="mt-1 text-sm text-red-600">{joinForm.errors.code}</p>}
                </form>

                {canCreate && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <button onClick={() => setShowCreate((v) => !v)} className="text-sm font-semibold text-isstm-navy">
                            {showCreate ? 'Annuler' : '+ Créer un groupe de classe'}
                        </button>
                        {showCreate && (
                            <form onSubmit={submitCreate} className="mt-3 space-y-2">
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="Nom du groupe (ex : L1 Informatique)"
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={createForm.data.annee}
                                        onChange={(e) => createForm.setData('annee', e.target.value)}
                                        placeholder="Année (2026)"
                                        className="w-1/2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={createForm.data.niveau}
                                        onChange={(e) => createForm.setData('niveau', e.target.value)}
                                        placeholder="Niveau (L1)"
                                        className="w-1/2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                    />
                                </div>
                                {createForm.errors.name && <p className="text-sm text-red-600">{createForm.errors.name}</p>}
                                <button disabled={createForm.processing} className="w-full rounded-lg bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                    Créer le groupe
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {groups.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 sm:col-span-2">
                        Vous n'êtes membre d'aucun groupe. Rejoignez-en un avec un code, ou créez-en un si vous êtes enseignant.
                    </p>
                )}
                {groups.map((group) => (
                    <Link
                        key={group.id}
                        href={`/groupes/${group.id}`}
                        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-isstm-navy/30 hover:shadow-md"
                    >
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
                        <p className="mt-3 text-xs text-slate-400">Enseignant : {group.teacher_name}</p>
                        <div className="mt-2 flex items-center gap-2">
                            {group.is_delegate && <span className="rounded-full bg-isstm-gold/10 px-2 py-0.5 text-[11px] font-semibold text-isstm-gold">Délégué</span>}
                            {group.join_code && (
                                <span className="rounded-full bg-isstm-navy/10 px-2 py-0.5 text-[11px] font-semibold text-isstm-navy">Code : {group.join_code}</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}
