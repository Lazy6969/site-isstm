import { Head, Link, router, useForm } from '@inertiajs/react';
import { Ban, Crown, FileText, Paperclip, Printer, Send, ShieldCheck, Trash2, UserCheck } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

function formatTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Show({ group, membership, members, messages, announcements }) {
    const { t } = useTranslations();
    const [tab, setTab] = useState('discussion');
    const messageForm = useForm({ body: '', attachments: [] });
    const announcementForm = useForm({ type: 'devoir', title: '', description: '', due_date: '' });

    const announcementTypes = [
        { value: 'devoir', label: t('groupes.type_devoir', 'Devoir') },
        { value: 'examen', label: t('groupes.type_examen', 'Examen') },
        { value: 'resultat', label: t('groupes.type_resultat', 'Résultat') },
        { value: 'autre', label: t('groupes.type_autre', 'Autre') },
    ];

    const tabs = [
        { key: 'discussion', label: t('groupes.onglet_discussion', 'Discussion') },
        { key: 'membres', label: t('groupes.onglet_membres', 'Membres') },
        { key: 'annonces', label: t('groupes.onglet_annonces', 'Annonces') },
    ];

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
        if (confirm(t('groupes.confirmer_suppression_annonce', 'Supprimer cette annonce ?'))) {
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
                    <h1 className="text-2xl font-bold text-isstm-navy dark:text-white">{group.name}</h1>
                    <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                        {[group.filiere, group.niveau, group.annee].filter(Boolean).join(' · ') || group.type_label}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {group.join_code && (
                        <Badge>
                            {t('groupes.code', 'Code :')} {group.join_code}
                        </Badge>
                    )}
                    {membership.can_download_presence && (
                        <Link
                            href={`/groupes/${group.id}/presence`}
                            className="flex items-center gap-1.5 rounded-full border border-isstm-navy/30 px-3 py-1.5 text-xs font-medium text-isstm-navy dark:text-white hover:bg-isstm-navy/5"
                        >
                            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('groupes.feuille_presence', 'Feuille de présence')}
                        </Link>
                    )}
                </div>
            </div>

            <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-700">
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setTab(item.key)}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            tab === item.key ? 'border-b-2 border-isstm-gold text-isstm-navy' : 'text-slate-500 hover:text-isstm-navy'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {tab === 'discussion' && (
                <Card className="flex h-[60vh] flex-col overflow-hidden">
                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {messages.length === 0 && <p className="text-center text-sm text-slate-400 dark:text-slate-500">{t('groupes.aucun_message', 'Aucun message pour le moment.')}</p>}
                        {messages.map((m) => (
                            <div key={m.id} className="group flex items-start gap-2.5">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{m.sender_name}</span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">{formatTime(m.created_at)}</span>
                                    </div>
                                    {m.deleted_for_everyone ? (
                                        <p className="text-sm italic text-slate-400 dark:text-slate-500">{t('groupes.message_supprime', 'Message supprimé')}</p>
                                    ) : (
                                        <>
                                            {m.body && <p className="text-sm text-slate-700 dark:text-slate-200">{m.body}</p>}
                                            {m.attachments.map((a) => (
                                                <a key={a.id} href={`/storage/${a.path}`} target="_blank" rel="noopener" className="mt-1 block">
                                                    {a.file_type === 'image' ? (
                                                        <img src={`/storage/${a.path}`} alt="" className="max-h-48 rounded-lg" />
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-xs font-medium text-isstm-navy dark:text-white underline">
                                                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                                            {a.original_name}
                                                        </span>
                                                    )}
                                                </a>
                                            ))}
                                            <div className="mt-0.5 flex gap-3 text-[11px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100">
                                                <button onClick={() => deleteMessage(m.id, 'me')} className="hover:underline">
                                                    {t('groupes.masquer_pour_moi', 'Masquer pour moi')}
                                                </button>
                                                <button onClick={() => deleteMessage(m.id, 'everyone')} className="hover:text-red-600 hover:underline">
                                                    {t('groupes.supprimer_pour_tous', 'Supprimer pour tous')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 p-3">
                        <label className="flex-shrink-0 text-slate-400 dark:text-slate-500" title={t('groupes.piece_jointe', 'Pièce jointe')}>
                            <Paperclip className="h-4 w-4" aria-hidden="true" />
                            <input
                                type="file"
                                multiple
                                onChange={(e) => messageForm.setData('attachments', Array.from(e.target.files))}
                                className="hidden"
                            />
                        </label>
                        <input
                            type="text"
                            value={messageForm.data.body}
                            onChange={(e) => messageForm.setData('body', e.target.value)}
                            placeholder={t('groupes.ecrire_message', 'Écrire un message…')}
                            className="flex-1 rounded-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <button disabled={messageForm.processing} className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('communaute.envoyer', 'Envoyer')}
                        </button>
                    </form>
                </Card>
            )}

            {tab === 'membres' && (
                <div className="space-y-2">
                    {members.map((m) => (
                        <Card key={m.id} className="flex items-center gap-3 p-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={m.avatar_path ? `/storage/${m.avatar_path}` : undefined} alt="" />
                                <AvatarFallback>{m.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{m.name}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    {m.role_in_group === 'enseignant' ? t('groupes.enseignant_role', 'Enseignant') : t('groupes.etudiant_role', 'Étudiant')}
                                    {m.is_delegate ? ` · ${t('groupes.delegue_classe', 'Délégué de classe')}` : ''}
                                    {m.is_banned ? ` · ${t('groupes.banni', 'Banni')}` : ''}
                                </p>
                            </div>
                            {membership.can_moderate && m.role_in_group !== 'enseignant' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleDelegate(m.id)}
                                        className="flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                                        {m.is_delegate ? t('groupes.retirer_delegue', 'Retirer délégué') : t('groupes.nommer_delegue', 'Nommer délégué')}
                                    </button>
                                    {m.is_banned ? (
                                        <button
                                            onClick={() => unbanMember(m.id)}
                                            className="flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                        >
                                            <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t('groupes.reintegrer', 'Réintégrer')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => banMember(m.id)}
                                            className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                        >
                                            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t('groupes.bannir', 'Bannir')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {tab === 'annonces' && (
                <div className="space-y-4">
                    {membership.can_moderate && (
                        <Card className="p-5">
                            <form onSubmit={submitAnnouncement}>
                                <div className="flex gap-2">
                                    <select
                                        value={announcementForm.data.type}
                                        onChange={(e) => announcementForm.setData('type', e.target.value)}
                                        className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                    >
                                        {announcementTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        value={announcementForm.data.title}
                                        onChange={(e) => announcementForm.setData('title', e.target.value)}
                                        placeholder={t('groupes.titre_placeholder', 'Titre')}
                                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                    />
                                    <input
                                        type="date"
                                        value={announcementForm.data.due_date}
                                        onChange={(e) => announcementForm.setData('due_date', e.target.value)}
                                        className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                    />
                                </div>
                                <textarea
                                    value={announcementForm.data.description}
                                    onChange={(e) => announcementForm.setData('description', e.target.value)}
                                    rows={2}
                                    placeholder={t('groupes.description_facultatif', 'Description (facultatif)')}
                                    className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                />
                                {announcementForm.errors.title && <p className="mt-1 text-sm text-red-600">{announcementForm.errors.title}</p>}
                                <div className="mt-2 flex justify-end">
                                    <button disabled={announcementForm.processing} className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                                        {t('groupes.publier_annonce', "Publier l'annonce")}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {announcements.length === 0 && (
                        <Card className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                            {t('groupes.aucune_annonce', 'Aucune annonce épinglée.')}
                        </Card>
                    )}
                    {announcements.map((a) => (
                        <Card key={a.id} className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Badge variant="gold">{a.type_label}</Badge>
                                    <h3 className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{a.title}</h3>
                                </div>
                                {membership.can_moderate && (
                                    <button onClick={() => deleteAnnouncement(a.id)} className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-red-600">
                                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        {t('communaute.supprimer', 'Supprimer')}
                                    </button>
                                )}
                            </div>
                            {a.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{a.description}</p>}
                            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                                {t('groupes.par', 'Par')} {a.teacher_name} · {formatTime(a.created_at)}
                                {a.due_date ? ` · ${t('groupes.echeance', 'Échéance :')} ${a.due_date}` : ''}
                            </p>
                        </Card>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
