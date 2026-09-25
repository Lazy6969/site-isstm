import { useForm } from '@inertiajs/react';
import { Globe, Image as ImageIcon, MapPin, Smile, Tag, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

const MOODS = [
    { emoji: '😊', key: 'heureux', label: 'Heureux(se)' },
    { emoji: '😍', key: 'amoureux', label: 'Amoureux(se)' },
    { emoji: '🎉', key: 'en_fete', label: 'En fête' },
    { emoji: '😢', key: 'triste', label: 'Triste' },
    { emoji: '😴', key: 'fatigue', label: 'Fatigué(e)' },
    { emoji: '🤔', key: 'pensif', label: 'Pensif(ve)' },
    { emoji: '💪', key: 'motive', label: 'Motivé(e)' },
    { emoji: '📚', key: 'en_revision', label: 'En révision' },
];

export default function ComposePostModal({ open, onClose, postTypes, friends, user }) {
    const { t } = useTranslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'autre',
        body: '',
        media: [],
        visibility: 'public',
        mood: '',
        location: '',
        tagged_user_ids: [],
    });
    const [showMoods, setShowMoods] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [showTagFriends, setShowTagFriends] = useState(false);

    function submit(e) {
        e.preventDefault();
        post('/communaute', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowMoods(false);
                setShowLocation(false);
                setShowTagFriends(false);
                onClose();
            },
        });
    }

    function toggleTag(friendId) {
        setData(
            'tagged_user_ids',
            data.tagged_user_ids.includes(friendId)
                ? data.tagged_user_ids.filter((id) => id !== friendId)
                : [...data.tagged_user_ids, friendId],
        );
    }

    function pickMood(mood) {
        setData('mood', data.mood === `${mood.emoji} ${mood.label}` ? '' : `${mood.emoji} ${mood.label}`);
        setShowMoods(false);
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{t('communaute.creer_publication', 'Créer une publication')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                            <div className="mt-0.5 flex items-center gap-2">
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="rounded-full border border-slate-300 bg-transparent px-2.5 py-1 text-xs dark:border-slate-600 dark:text-white"
                                >
                                    {postTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={data.visibility}
                                    onChange={(e) => setData('visibility', e.target.value)}
                                    className="flex items-center rounded-full border border-slate-300 bg-transparent px-2.5 py-1 text-xs dark:border-slate-600 dark:text-white"
                                >
                                    <option value="public">{t('communaute.visibilite_public', 'Public')}</option>
                                    <option value="amis">{t('communaute.visibilite_amis', 'Amis')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <textarea
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        rows={4}
                        autoFocus
                        placeholder={t('communaute.placeholder_publication', 'Partager une actualité avec la communauté…')}
                        className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-isstm-navy focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    />
                    {errors.body && <p className="text-sm text-red-600">{errors.body}</p>}

                    {data.mood && (
                        <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
                            <span>
                                {t('communaute.se_sent', 'Se sent')} {data.mood}
                            </span>
                            <button type="button" onClick={() => setData('mood', '')} aria-label={t('nav.annuler', 'Annuler')}>
                                <X className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                            </button>
                        </p>
                    )}

                    {data.location && (
                        <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                                {data.location}
                            </span>
                            <button type="button" onClick={() => setData('location', '')} aria-label={t('nav.annuler', 'Annuler')}>
                                <X className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                            </button>
                        </p>
                    )}

                    {data.tagged_user_ids.length > 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('communaute.avec', 'Avec')}{' '}
                            <span className="font-medium text-isstm-navy dark:text-white">
                                {friends.filter((f) => data.tagged_user_ids.includes(f.id)).map((f) => f.name).join(', ')}
                            </span>
                        </p>
                    )}

                    {data.media.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {data.media.map((file, i) => (
                                <span key={i} className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {file.name}
                                    <button type="button" onClick={() => setData('media', data.media.filter((_, fi) => fi !== i))} aria-label={t('nav.annuler', 'Annuler')}>
                                        <X className="h-3 w-3" aria-hidden="true" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {showTagFriends && (
                        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                            {friends.length === 0 && <p className="p-2 text-xs text-slate-400">{t('communaute.aucun_ami', "Vous n'avez pas encore d'amis.")}</p>}
                            {friends.map((friend) => (
                                <label key={friend.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <input
                                        type="checkbox"
                                        checked={data.tagged_user_ids.includes(friend.id)}
                                        onChange={() => toggleTag(friend.id)}
                                        className="rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy/30"
                                    />
                                    {friend.name}
                                </label>
                            ))}
                        </div>
                    )}

                    {showLocation && (
                        <input
                            type="text"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder={t('communaute.lieu_placeholder', 'Ajouter un lieu…')}
                            autoFocus
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        />
                    )}

                    {showMoods && (
                        <div className="grid grid-cols-4 gap-1.5">
                            {MOODS.map((mood) => (
                                <button
                                    key={mood.key}
                                    type="button"
                                    onClick={() => pickMood(mood)}
                                    className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                >
                                    <span className="text-xl">{mood.emoji}</span>
                                    {mood.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('communaute.ajouter_a_publication', 'Ajouter à votre publication')}</span>
                        <div className="flex items-center gap-1">
                            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700" title={t('communaute.photo_video', 'Photo/Vidéo')}>
                                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(e) => setData('media', [...data.media, ...Array.from(e.target.files)])}
                                    className="hidden"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowTagFriends((v) => !v)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-isstm-navy hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"
                                title={t('communaute.identifier_amis', 'Identifier des amis')}
                            >
                                <Tag className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowMoods((v) => !v)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title={t('communaute.ajouter_humeur', 'Ajouter une humeur')}
                            >
                                <Smile className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLocation((v) => !v)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title={t('communaute.ajouter_lieu', 'Ajouter un lieu')}
                            >
                                <MapPin className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <DialogFooter>
                        <button
                            type="submit"
                            disabled={processing || (!data.body && data.media.length === 0)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-isstm-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-isstm-navy-dark disabled:opacity-50"
                        >
                            {data.visibility === 'amis' ? <Users className="h-4 w-4" aria-hidden="true" /> : <Globe className="h-4 w-4" aria-hidden="true" />}
                            {t('communaute.publier', 'Publier')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
