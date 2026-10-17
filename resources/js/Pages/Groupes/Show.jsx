import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArchiveRestore, ArrowLeft, Ban, Camera, Check, Crown, MoreHorizontal, Pencil, Printer, Send, ShieldCheck, Trash2, UserCheck, UserPlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import GroupMessageBubble from '../../Components/Messages/GroupMessageBubble';
import { AttachmentButton, SelectedAttachments, useAttachmentPicker } from '../../Components/Messages/AttachmentPicker';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../Components/ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';
import { useConfirm } from '../../lib/useConfirm';

function formatTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Show({ group, membership, members, messages, announcements, friendsNotInGroup, friends, conversations }) {
    const confirmAction = useConfirm();
    const { t } = useTranslations();
    const { auth } = usePage().props;
    const [tab, setTab] = useState('discussion');
    const [showAddFriends, setShowAddFriends] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [editingName, setEditingName] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const photoInputRef = useRef(null);
    const messageForm = useForm({ body: '', attachments: [], reply_to_id: null });
    const attachmentPicker = useAttachmentPicker(messageForm.data.attachments, (files) => messageForm.setData('attachments', files), messageForm.errors);
    const announcementForm = useForm({ type: 'devoir', title: '', description: '', due_date: '' });
    const nameForm = useForm({ name: group.name });

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
            onSuccess: () => {
                messageForm.reset();
                setReplyingTo(null);
            },
        });
    }

    function startReply(message) {
        setReplyingTo(message);
        messageForm.setData('reply_to_id', message.id);
    }

    function cancelReply() {
        setReplyingTo(null);
        messageForm.setData('reply_to_id', null);
    }

    function submitName(e) {
        e.preventDefault();
        nameForm.post(`/groupes/${group.id}/modifier`, {
            preserveScroll: true,
            onSuccess: () => setEditingName(false),
        });
    }

    function onPhotoSelected(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        router.post(`/groupes/${group.id}/modifier`, { photo: file }, { forceFormData: true, preserveScroll: true });
    }

    function submitAnnouncement(e) {
        e.preventDefault();
        announcementForm.post(`/groupes/${group.id}/annonces`, {
            preserveScroll: true,
            onSuccess: () => announcementForm.reset(),
        });
    }

    async function deleteAnnouncement(id) {
        if (await confirmAction({ message: t('groupes.confirmer_suppression_annonce', 'Supprimer cette annonce ?'), title: 'Supprimer cette annonce ?', confirmLabel: 'Supprimer' })) {
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

    function toggleFriendSelection(friendId) {
        setSelectedFriends((prev) => (prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]));
    }

    function submitAddFriends(e) {
        e.preventDefault();
        router.post(
            `/groupes/${group.id}/membres`,
            { user_ids: selectedFriends },
            { preserveScroll: true, onSuccess: () => { setSelectedFriends([]); setShowAddFriends(false); } },
        );
    }

    async function archiveGroup() {
        if (await confirmAction({ message: t('groupes.confirmer_archiver', 'Archiver ce groupe ? Il restera consultable dans « Groupes archivés ».'), tone: 'warning', title: 'Archiver ce groupe ?', confirmLabel: 'Archiver' })) {
            router.post(`/groupes/${group.id}/archiver`, {}, { preserveScroll: true });
        }
    }

    async function destroyGroup() {
        if (await confirmAction({ message: t('groupes.confirmer_suppression_groupe', 'Supprimer définitivement ce groupe ? Cette action est irréversible.'), title: 'Supprimer ce groupe ?', confirmLabel: 'Supprimer définitivement' })) {
            router.delete(`/groupes/${group.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={group.name} />

            <Link href="/groupes" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('groupes.retour_mes_groupes', 'Retour à mes groupes')}
            </Link>

            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="group relative flex-shrink-0"
                        aria-label={t('groupes.changer_photo', 'Changer la photo du groupe')}
                    >
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={group.photo_path ? `/storage/${group.photo_path}` : undefined} alt="" />
                            <AvatarFallback>{group.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                            <Camera className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" onChange={onPhotoSelected} className="hidden" />

                    <div>
                        {editingName ? (
                            <form onSubmit={submitName} className="flex items-center gap-1.5">
                                <input
                                    type="text"
                                    autoFocus
                                    value={nameForm.data.name}
                                    onChange={(e) => nameForm.setData('name', e.target.value)}
                                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xl font-bold text-isstm-navy focus:border-isstm-navy focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                />
                                <button type="submit" className="text-emerald-600" aria-label={t('profil.enregistrer', 'Enregistrer')}>
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingName(false);
                                        nameForm.setData('name', group.name);
                                    }}
                                    className="text-slate-400"
                                    aria-label={t('nav.annuler', 'Annuler')}
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </form>
                        ) : (
                            <div className="group flex items-center gap-1.5">
                                <h1 className="text-2xl font-bold text-isstm-navy dark:text-white">{group.name}</h1>
                                <button
                                    type="button"
                                    onClick={() => setEditingName(true)}
                                    className="text-slate-300 opacity-0 transition hover:text-isstm-navy group-hover:opacity-100 dark:hover:text-white"
                                    aria-label={t('groupes.renommer', 'Renommer le groupe')}
                                >
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                        )}
                        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            {[group.filiere, group.niveau, group.annee].filter(Boolean).join(' · ') || group.type_label}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {group.join_code && (
                        <Badge>
                            {t('groupes.code', 'Code :')} {group.join_code}
                        </Badge>
                    )}
                    {group.has_presence && membership.can_download_presence && (
                        <Link
                            href={`/groupes/${group.id}/presence`}
                            className="flex items-center gap-1.5 rounded-full border border-isstm-navy/30 px-3 py-1.5 text-xs font-medium text-isstm-navy dark:text-white hover:bg-isstm-navy/5"
                        >
                            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('groupes.feuille_presence', 'Feuille de présence')}
                        </Link>
                    )}
                    {membership.can_moderate && friendsNotInGroup.length > 0 && (
                        <button
                            onClick={() => setShowAddFriends((v) => !v)}
                            className="flex items-center gap-1.5 rounded-full border border-isstm-navy/30 px-3 py-1.5 text-xs font-medium text-isstm-navy dark:text-white hover:bg-isstm-navy/5"
                        >
                            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('groupes.ajouter_amis', 'Ajouter des amis')}
                        </button>
                    )}
                    {membership.can_moderate && (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700">
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={archiveGroup}>
                                    <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                                    {t('groupes.archiver', 'Archiver le groupe')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={destroyGroup} className="text-red-600">
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    {t('groupes.supprimer_groupe', 'Supprimer le groupe')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {showAddFriends && (
                <Card className="mb-6 p-5">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy dark:text-white">{t('groupes.ajouter_amis', 'Ajouter des amis')}</h2>
                    <form onSubmit={submitAddFriends}>
                        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                            {friendsNotInGroup.map((friend) => (
                                <label
                                    key={friend.id}
                                    className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFriends.includes(friend.id)}
                                        onChange={() => toggleFriendSelection(friend.id)}
                                        className="rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy/30"
                                    />
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={friend.avatar_path ? `/storage/${friend.avatar_path}` : undefined} alt="" />
                                        <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate text-slate-700 dark:text-slate-200">{friend.name}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            disabled={selectedFriends.length === 0}
                            className="mt-3 flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('groupes.ajouter_selection', 'Ajouter')} {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
                        </button>
                    </form>
                </Card>
            )}

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
                    <div className="flex-1 space-y-3 overflow-y-auto p-4 pr-6">
                        {messages.length === 0 && <p className="text-center text-sm text-slate-400 dark:text-slate-500">{t('groupes.aucun_message', 'Aucun message pour le moment.')}</p>}
                        {messages.map((m) => (
                            <GroupMessageBubble
                                key={m.id}
                                message={m}
                                isOwn={m.sender_id === auth.user.id}
                                canModerate={membership.can_moderate}
                                conversations={conversations}
                                friends={friends}
                                onReply={() => startReply(m)}
                            />
                        ))}
                    </div>

                    {replyingTo && (
                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            <span className="truncate">
                                {t('messages.reponse_a', 'Réponse à')}{' '}
                                <span className="font-medium">
                                    {replyingTo.sender_id === auth.user.id ? t('messages.vous', 'vous') : replyingTo.sender_name}
                                </span>
                                {replyingTo.body ? ` · ${replyingTo.body}` : ''}
                            </span>
                            <button type="button" onClick={cancelReply} className="flex-shrink-0" aria-label={t('nav.annuler', 'Annuler')}>
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    )}

                    <SelectedAttachments files={messageForm.data.attachments} picker={attachmentPicker} />

                    <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 p-3">
                        <AttachmentButton picker={attachmentPicker} disabled={messageForm.processing} />
                        <input
                            type="text"
                            value={messageForm.data.body}
                            onChange={(e) => messageForm.setData('body', e.target.value)}
                            placeholder={t('groupes.ecrire_message', 'Écrire un message…')}
                            className="flex-1 rounded-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <button
                            disabled={messageForm.processing}
                            aria-label={t('communaute.envoyer', 'Envoyer')}
                            className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:px-4"
                        >
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="hidden sm:inline">{t('communaute.envoyer', 'Envoyer')}</span>
                        </button>
                    </form>
                </Card>
            )}

            {tab === 'membres' && (
                <div className="space-y-2">
                    {members.map((m) => (
                        <Card key={m.id} className="flex items-center gap-3 p-4">
                            <Link href={`/profil/${m.user_id}`} className="flex min-w-0 flex-1 items-center gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={m.avatar_path ? `/storage/${m.avatar_path}` : undefined} alt="" />
                                    <AvatarFallback>{m.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800 hover:underline dark:text-slate-100">{m.name}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        {m.role_in_group === 'enseignant' ? t('groupes.enseignant_role', 'Enseignant') : t('groupes.etudiant_role', 'Étudiant')}
                                        {m.is_delegate ? ` · ${t('groupes.delegue_classe', 'Délégué de classe')}` : ''}
                                        {m.is_banned ? ` · ${t('groupes.banni', 'Banni')}` : ''}
                                    </p>
                                </div>
                            </Link>
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
