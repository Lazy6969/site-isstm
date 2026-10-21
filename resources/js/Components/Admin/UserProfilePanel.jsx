import { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Camera, CalendarDays, Clock, Mail, Phone, Save, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslations } from '../../lib/useTranslations';

function initials(name) {
    return (name ?? '?')
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function formatDate(value) {
    if (!value) return '—';

    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Field({ icon: Icon, label, error, children }) {
    return (
        <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">
                <Icon className="h-3.5 w-3.5 text-admin-accent" aria-hidden="true" />
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

const MAX_PICKED_BYTES = 15 * 1024 * 1024;
const SERVER_LIMIT_BYTES = 2 * 1024 * 1024;
const AVATAR_SIZE = 1024;

/**
 * The server refuses photos above 2 Mo, which a phone camera exceeds easily — so a
 * large picture is scaled down (1024 px, JPEG) in the browser before it is sent.
 */
async function prepareAvatar(file) {
    if (!file.type.startsWith('image/')) throw new Error('Ce fichier n’est pas une image (JPG, PNG ou WebP).');
    if (file.size > MAX_PICKED_BYTES) throw new Error('Cette image est trop lourde (15 Mo maximum).');

    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) {
        if (file.size > SERVER_LIMIT_BYTES) throw new Error('Image illisible ou trop lourde : choisissez un JPG, PNG ou WebP de moins de 2 Mo.');
        return file;
    }

    const scale = Math.min(1, AVATAR_SIZE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= SERVER_LIMIT_BYTES) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) return file;

    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
}

const inputClass =
    'h-11 w-full rounded-xl border border-admin-border bg-admin-bg/50 px-3.5 text-sm text-admin-text outline-none transition placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

/**
 * Profile editor shown inside the page, next to the list (not in a pop-up):
 * photo, name, e-mail and phone of another account — same fields and same
 * endpoint as the dialog it replaces.
 */
export default function UserProfilePanel({ user, roleLabel, isSelf, onClose }) {
    const { t } = useTranslations();
    const form = useForm({ name: user.name, email: user.email, phone: user.phone ?? '', avatar: null });
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const fileInput = useRef(null);
    const [problem, setProblem] = useState(null);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const dirty = form.data.name !== user.name || form.data.email !== user.email || (form.data.phone ?? '') !== (user.phone ?? '') || form.data.avatar !== null;

    async function pickAvatar(file) {
        if (!file) return;
        setProblem(null);
        try {
            const prepared = await prepareAvatar(file);
            form.setData('avatar', prepared);
            setPreview(URL.createObjectURL(prepared));
        } catch (error) {
            setProblem(error.message);
        }
    }

    function submit(e) {
        e.preventDefault();
        setProblem(null);
        let saved = false;
        let rejected = false;

        form.post(`/console/users/${user.id}/profile`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                saved = true;
                setPreview(null);
                onClose();
            },
            onError: () => {
                rejected = true;
            },
            onFinish: () => {
                // Neither saved nor refused field by field: a server or permission error.
                if (!saved && !rejected) setProblem('L’enregistrement a échoué (erreur du serveur ou droits insuffisants). Réessayez ou rechargez la page.');
            },
        });
    }

    const messages = [problem, ...Object.values(form.errors)].filter(Boolean);

    const avatarSrc = preview ?? (user.avatar_path ? `/storage/${user.avatar_path}` : null);

    return (
        <aside className="relative overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-lg" aria-label={`Modifier le profil de ${user.name}`}>
            <div className="relative h-24 bg-gradient-to-br from-admin-accent via-admin-accent/90 to-sky-500">
                <span className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                <button type="button" onClick={onClose} aria-label={t('admin.auto.fermer_7d20', 'Fermer')} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/35">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <form onSubmit={submit} className="px-5 pb-5">
                <div className="-mt-12 flex items-end gap-4">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            pickAvatar(e.dataTransfer.files?.[0]);
                        }}
                        className={cn('group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-3xl bg-admin-card shadow-xl ring-4 ring-admin-card transition', dragging && 'scale-105 ring-admin-accent')}
                    >
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-admin-accent/20 to-sky-500/20 text-2xl font-bold text-admin-accent">{initials(user.name)}</span>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInput.current?.click()}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/55 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                        >
                            <Camera className="h-5 w-5" aria-hidden="true" />
                            Changer
                        </button>
                        <input ref={fileInput} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="sr-only" onChange={(e) => pickAvatar(e.target.files?.[0])} />
                    </div>
                    <div className="min-w-0 pb-1">
                        <p className="truncate text-base font-bold text-admin-text">{user.name}</p>
                        <p className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-admin-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-admin-accent">
                            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                            {roleLabel}
                            {isSelf && ' · vous'}
                        </p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600" role="alert">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <ul className="space-y-0.5">
                            {messages.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {form.data.avatar && <p className="mt-2 text-xs text-admin-text-secondary">Nouvelle photo : {form.data.avatar.name}</p>}

                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-admin-bg/60 p-2.5">
                        <dt className="flex items-center gap-1.5 text-admin-muted">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                            Compte créé le
                        </dt>
                        <dd className="mt-0.5 font-semibold text-admin-text">{formatDate(user.created_at)}</dd>
                    </div>
                    <div className="rounded-xl bg-admin-bg/60 p-2.5">
                        <dt className="flex items-center gap-1.5 text-admin-muted">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            Dernière connexion
                        </dt>
                        <dd className="mt-0.5 font-semibold text-admin-text">{formatDate(user.last_activity)}</dd>
                    </div>
                </dl>

                <div className="mt-5 space-y-4">
                    <Field icon={UserIcon} label={t('admin.auto.nom_complet_bcdc', 'Nom complet')} error={form.errors.name}>
                        <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={inputClass} autoComplete="off" />
                    </Field>
                    <Field icon={Mail} label="E-mail" error={form.errors.email}>
                        <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className={inputClass} autoComplete="off" />
                    </Field>
                    <Field icon={Phone} label={t('admin.auto.telephone_301d', 'Téléphone')} error={form.errors.phone}>
                        <input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} className={inputClass} autoComplete="off" />
                    </Field>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-admin-border pt-4">
                    <span className={cn('text-xs font-semibold text-amber-600 transition-opacity', dirty ? 'opacity-100' : 'opacity-0')}>{t('admin.auto.modifications_non_enregistrees_3d9d', 'Modifications non enregistrées')}</span>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="rounded-full border border-admin-border px-4 py-2 text-sm font-semibold text-admin-text-secondary transition hover:bg-admin-hover">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing || !dirty}
                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-admin-accent to-sky-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            Enregistrer
                        </button>
                    </div>
                </div>
            </form>
        </aside>
    );
}
