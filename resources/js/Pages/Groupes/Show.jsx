import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';

const announcementTypes = [
    { value: 'devoir', label: 'Devoir' },
    { value: 'examen', label: 'Examen' },
    { value: 'resultat', label: 'Résultat' },
    { value: 'autre', label: 'Autre' },
];

function formatTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const tabs = [
    { key: 'discussion', label: 'Discussion' },
    { key: 'membres', label: 'Membres' },
    { key: 'annonces', label: 'Annonces' },
];

export default function Show({ group, membership, members, messages, announcements }) {
    const [tab, setTab] = useState('discussion');
    const messageForm = useForm({ body: '', attachments: [] });
    const announcementForm = useForm({ type: 'devoir', title: '', description: '', due_date: '' });

    function sendMessage(e) {
        e.preventDefault();
        messageForm.post(`/groupes/${group.id}/messages`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => messageForm.reset(),
        });
    }

    function deleteMessage(id, scope) {
        router.delete(`/groupes/messages/${id}`, { data: { scope }, preserveScroll: true });
    }

    function submitAnnouncement(e) {
        e.preventDefault();
        announcementForm.post(`/groupes/${group.id}/annonces`, {
            preserveScroll: true,
            onSuccess: () => announcementForm.reset(),
        });
    }

    function deleteAnnouncement(id) {
        if (confirm('Supprimer cette annonce ?')) {
            router.delete(`/groupes/annonces/${id}`, { preserveScroll: true });
        }
    }

    function banMember(memberId) {
        router.post(`/groupes/membres/${memberId}/bannir`, {}, { preserveScroll: true });
    }

    function unbanMember(memberId) {
        router.post(`/groupes/membres/${memberId}/reintegrer`, {}, { preserveScroll: true });
    }

    function toggleDelegate(memberId) {
        router.post(`/groupes/membres/${memberId}/delegue`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title={group.name} />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-isstm-navy">{group.name}</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        {[group.filiere, group.niveau, group.annee].filter(Boolean).join(' · ') || group.type_label}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {group.join_code && (
                        <span className="rounded-full bg-isstm-navy/10 px-3 py-1.5 text-xs font-semibold text-isstm-navy">Code : {group.join_code}</span>
                    )}
                    {membership.can_download_presence && (
                        <Link href={`/groupes/${group.id}/presence`} className="rounded-full border border-isstm-navy/30 px-3 py-1.5 text-xs font-medium text-isstm-navy hover:bg-isstm-navy/5">
                            Feuille de présence
                        </Link>
                    )}
                </div>
            </div>

            <div className="mb-6 flex gap-1 border-b border-slate-200">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            tab === t.key ? 'border-b-2 border-isstm-gold text-isstm-navy' : 'text-slate-500 hover:text-isstm-navy'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'discussion' && (
                <div className="flex h-[60vh] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {messages.length === 0 && <p className="text-center text-sm text-slate-400">Aucun message pour le moment.</p>}
                        {messages.map((m) => (
                            <div key={m.id} className="group flex items-start gap-2.5">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-slate-800">{m.sender_name}</span>
                                        <span className="text-xs text-slate-400">{formatTime(m.created_at)}</span>
                                    </div>
                                    {m.deleted_for_everyone ? (
                                        <p className="text-sm italic text-slate-400">Message supprimé</p>
                                    ) : (
                                        <>
                                            {m.body && <p className="text-sm text-slate-700">{m.body}</p>}
                                            {m.attachments.map((a) => (
                                                <a key={a.id} href={`/storage/${a.path}`} target="_blank" rel="noopener" className="mt-1 block">
                                                    {a.file_type === 'image' ? (
                                                        <img src={`/storage/${a.path}`} alt="" className="max-h-48 rounded-lg" />
                                                    ) : (
                                                        <span className="text-xs font-medium text-isstm-navy underline">{a.original_name}</span>
                                                    )}
                                                </a>
                                            ))}
                                            <div className="mt-0.5 flex gap-3 text-[11px] text-slate-400 opacity-0 group-hover:opacity-100">
                                                <button onClick={() => deleteMessage(m.id, 'me')} className="hover:underline">
                                                    Masquer pour moi
                                                </button>
                                                <button onClick={() => deleteMessage(m.id, 'everyone')} className="hover:text-red-600 hover:underline">
                                                    Supprimer pour tous
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-100 p-3">
                        <input
                            type="file"
                            multiple
                            onChange={(e) => messageForm.setData('attachments', Array.from(e.target.files))}
                            className="w-32 text-xs text-slate-400"
                        />
                        <input
                            type="text"
                            value={messageForm.data.body}
                            onChange={(e) => messageForm.setData('body', e.target.value)}
                            placeholder="Écrire un message…"
                            className="flex-1 rounded-full border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <button disabled={messageForm.processing} className="rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                            Envoyer
                        </button>
                    </form>
                </div>
            )}

            {tab === 'membres' && (
                <div className="space-y-2">
                    {members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                            <img
                                src={m.avatar_path ? `/storage/${m.avatar_path}` : '/images/logo-isstm.jpg'}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">{m.name}</p>
                                <p className="text-xs text-slate-400">
                                    {m.role_in_group === 'enseignant' ? 'Enseignant' : 'Étudiant'}
                                    {m.is_delegate ? ' · Délégué de classe' : ''}
                                    {m.is_banned ? ' · Banni' : ''}
                                </p>
                            </div>
                            {membership.can_moderate && m.role_in_group !== 'enseignant' && (
                                <div className="flex gap-2">
                                    <button onClick={() => toggleDelegate(m.id)} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                                        {m.is_delegate ? 'Retirer délégué' : 'Nommer délégué'}
                                    </button>
                                    {m.is_banned ? (
                                        <button onClick={() => unbanMember(m.id)} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                                            Réintégrer
                                        </button>
                                    ) : (
                                        <button onClick={() => banMember(m.id)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                                            Bannir
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {tab === 'annonces' && (
                <div className="space-y-4">
                    {membership.can_moderate && (
                        <form onSubmit={submitAnnouncement} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex gap-2">
                                <select
                                    value={announcementForm.data.type}
                                    onChange={(e) => announcementForm.setData('type', e.target.value)}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                >
                                    {announcementTypes.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={announcementForm.data.title}
                                    onChange={(e) => announcementForm.setData('title', e.target.value)}
                                    placeholder="Titre"
                                    className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                />
                                <input
                                    type="date"
                                    value={announcementForm.data.due_date}
                                    onChange={(e) => announcementForm.setData('due_date', e.target.value)}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                />
                            </div>
                            <textarea
                                value={announcementForm.data.description}
                                onChange={(e) => announcementForm.setData('description', e.target.value)}
                                rows={2}
                                placeholder="Description (facultatif)"
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                            />
                            {announcementForm.errors.title && <p className="mt-1 text-sm text-red-600">{announcementForm.errors.title}</p>}
                            <div className="mt-2 flex justify-end">
                                <button disabled={announcementForm.processing} className="rounded-full bg-isstm-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                    Publier l'annonce
                                </button>
                            </div>
                        </form>
                    )}

                    {announcements.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                            Aucune annonce épinglée.
                        </p>
                    )}
                    {announcements.map((a) => (
                        <div key={a.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="rounded-full bg-isstm-gold/10 px-2.5 py-1 text-xs font-semibold text-isstm-gold">{a.type_label}</span>
                                    <h3 className="mt-2 font-semibold text-slate-800">{a.title}</h3>
                                </div>
                                {membership.can_moderate && (
                                    <button onClick={() => deleteAnnouncement(a.id)} className="text-xs font-medium text-slate-400 hover:text-red-600">
                                        Supprimer
                                    </button>
                                )}
                            </div>
                            {a.description && <p className="mt-2 text-sm text-slate-600">{a.description}</p>}
                            <p className="mt-3 text-xs text-slate-400">
                                Par {a.teacher_name} · {formatTime(a.created_at)}
                                {a.due_date ? ` · Échéance : ${a.due_date}` : ''}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
