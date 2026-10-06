import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Camera, Check, Eye, EyeOff, KeyRound, Loader2, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { useTranslations } from '../../lib/useTranslations';

const fieldClass =
    'h-11 w-full rounded-xl border border-admin-border bg-admin-bg/40 px-3.5 text-sm text-admin-text outline-none transition placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

function Field({ id, label, icon: Icon, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-admin-muted">
                {label}
            </label>
            <div className="relative">
                {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />}
                {children}
            </div>
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}

/** Password input with an eye button to show / hide what is typed. */
function SecretField({ id, label, value, onChange, error, autoComplete }) {
    const { t } = useTranslations();
    const [revealed, setRevealed] = useState(false);

    return (
        <Field id={id} label={label} icon={KeyRound} error={error}>
            <input id={id} type={revealed ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} className={`${fieldClass} pl-10 pr-11`} />
            <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                aria-label={revealed ? t('auth.masquer_mot_de_passe', 'Masquer le mot de passe') : t('auth.afficher_mot_de_passe', 'Afficher le mot de passe')}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-admin-muted transition hover:text-admin-text"
            >
                {revealed ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
        </Field>
    );
}

/** Live checklist matching the server rule: 8+ characters, upper + lower case, a digit. */
function PasswordStrength({ value }) {
    const { t } = useTranslations();
    const rules = [
        [value.length >= 8, t('admin.profile.rule_length', '8 caractères minimum')],
        [/[a-z]/.test(value) && /[A-Z]/.test(value), t('admin.profile.rule_case', 'Majuscule et minuscule')],
        [/\d/.test(value), t('admin.profile.rule_digit', 'Au moins un chiffre')],
    ];
    const score = rules.filter(([ok]) => ok).length;
    const tones = ['bg-admin-border', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];

    return (
        <div className="space-y-2">
            <div className="flex gap-1.5" aria-hidden="true">
                {[1, 2, 3].map((step) => (
                    <span key={step} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step <= score ? tones[score] : 'bg-admin-border'}`} />
                ))}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {rules.map(([ok, label]) => (
                    <li key={label} className={`flex items-center gap-1.5 transition-colors ${ok ? 'text-emerald-500' : 'text-admin-muted'}`}>
                        <Check className={`h-3.5 w-3.5 ${ok ? '' : 'opacity-30'}`} aria-hidden="true" />
                        {label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * The signed-in admin's profile, edited in a drawer over the current page —
 * no navigation away from what they were doing. Saves through the existing
 * profile and password endpoints, which redirect back.
 */
export default function AdminProfilePanel({ open, onOpenChange }) {
    const { t } = useTranslations();
    const user = usePage().props.auth?.user;
    const [tab, setTab] = useState('profile');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileRef = useRef(null);

    const profileForm = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        city: user?.city ?? '',
        bio: user?.bio ?? '',
        avatar: null,
    });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    // Re-sync with the freshly saved user each time the drawer opens.
    useEffect(() => {
        if (!open || !user) return;
        profileForm.setData({ name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '', city: user.city ?? '', bio: user.bio ?? '', avatar: null });
        profileForm.clearErrors();
        passwordForm.reset();
        passwordForm.clearErrors();
        setAvatarPreview(null);
        setTab('profile');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => () => avatarPreview && URL.revokeObjectURL(avatarPreview), [avatarPreview]);

    const dirty = useMemo(
        () =>
            profileForm.data.avatar !== null ||
            ['name', 'email', 'phone', 'city', 'bio'].some((key) => (profileForm.data[key] ?? '') !== (user?.[key] ?? '')),
        [profileForm.data, user],
    );

    if (!user) return null;

    const roleValue = typeof user.role === 'string' ? user.role : user.role?.value;
    const roleLabel = t(`admin.role.${roleValue}`, roleValue ?? '');
    const avatarSrc = avatarPreview ?? (user.avatar_path ? `/storage/${user.avatar_path}` : null);

    function pickAvatar(file) {
        if (!file) return;
        profileForm.setData('avatar', file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    function saveProfile(e) {
        e.preventDefault();
        profileForm.transform((data) => ({ ...data, _method: 'patch' }));
        profileForm.post('/profil', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                profileForm.setData('avatar', null);
                setAvatarPreview(null);
            },
        });
    }

    function savePassword(e) {
        e.preventDefault();
        passwordForm.put('/profil/mot-de-passe', { preserveScroll: true, onSuccess: () => passwordForm.reset() });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto border-admin-border bg-admin-card p-0 text-admin-text dark:bg-admin-card dark:text-admin-text sm:max-w-md">
                <SheetTitle className="sr-only">{t('admin.profile.title', 'Mon profil')}</SheetTitle>

                <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-admin-accent via-admin-accent/80 to-admin-accent/40 px-6 pb-16 pt-8">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{t('admin.profile.title', 'Mon profil')}</p>
                </div>

                <div className="relative -mt-12 flex flex-shrink-0 items-end gap-4 px-6">
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        aria-label={t('admin.profile.change_photo', 'Changer la photo')}
                        className="group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-admin-card bg-admin-hover shadow-xl transition hover:scale-105"
                    >
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center bg-admin-accent/15 text-3xl font-bold text-admin-accent">{user.name?.[0]?.toUpperCase()}</span>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <Camera className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => pickAvatar(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
                    <div className="min-w-0 pb-1">
                        <p className="truncate text-lg font-semibold text-admin-text">{user.name}</p>
                        <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border border-admin-accent/30 bg-admin-accent/10 px-2.5 py-0.5 text-xs font-medium text-admin-accent">
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            {roleLabel}
                        </span>
                    </div>
                </div>
                {profileForm.errors.avatar && <p className="px-6 pt-2 text-xs text-red-400">{profileForm.errors.avatar}</p>}

                <div className="mx-6 mt-6 flex flex-shrink-0 gap-1 rounded-xl bg-admin-hover p-1" role="tablist">
                    {[
                        ['profile', UserRound, t('admin.profile.tab_profile', 'Informations')],
                        ['security', KeyRound, t('admin.profile.tab_security', 'Mot de passe')],
                    ].map(([value, Icon, label]) => (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={tab === value}
                            onClick={() => setTab(value)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                tab === value ? 'bg-admin-card text-admin-text shadow-sm' : 'text-admin-muted hover:text-admin-text'
                            }`}
                        >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'profile' ? (
                    <form onSubmit={saveProfile} className="animate-in fade-in-0 slide-in-from-right-2 flex flex-1 flex-col duration-300">
                        <div className="flex-1 space-y-4 px-6 py-5">
                            <Field id="profile-name" label={t('profil.nom_complet', 'Nom complet')} icon={UserRound} error={profileForm.errors.name}>
                                <input id="profile-name" value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} className={`${fieldClass} pl-10`} required />
                            </Field>
                            <Field id="profile-email" label={t('auth.email', 'Adresse e-mail')} icon={Mail} error={profileForm.errors.email}>
                                <input id="profile-email" type="email" value={profileForm.data.email} onChange={(e) => profileForm.setData('email', e.target.value)} className={`${fieldClass} pl-10`} required />
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field id="profile-phone" label={t('profil.telephone', 'Téléphone')} icon={Phone} error={profileForm.errors.phone}>
                                    <input id="profile-phone" value={profileForm.data.phone} onChange={(e) => profileForm.setData('phone', e.target.value)} className={`${fieldClass} pl-10`} />
                                </Field>
                                <Field id="profile-city" label={t('profil.ville', 'Ville')} icon={MapPin} error={profileForm.errors.city}>
                                    <input id="profile-city" value={profileForm.data.city} onChange={(e) => profileForm.setData('city', e.target.value)} className={`${fieldClass} pl-10`} />
                                </Field>
                            </div>
                            <Field id="profile-bio" label={t('profil.bio', 'Bio')} error={profileForm.errors.bio}>
                                <textarea
                                    id="profile-bio"
                                    value={profileForm.data.bio}
                                    onChange={(e) => profileForm.setData('bio', e.target.value)}
                                    rows={4}
                                    maxLength={500}
                                    className={`${fieldClass} h-auto resize-none py-3`}
                                />
                                <p className="mt-1 text-right text-xs text-admin-muted">{profileForm.data.bio.length} / 500</p>
                            </Field>
                        </div>

                        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-admin-border bg-admin-card/95 px-6 py-4 backdrop-blur">
                            <p className={`text-xs transition-colors ${dirty ? 'text-amber-500' : 'text-admin-muted'}`}>{dirty ? t('admin.appearance.unsaved', 'Modifications non enregistrées') : t('admin.profile.up_to_date', 'Profil à jour')}</p>
                            <button
                                type="submit"
                                disabled={profileForm.processing || !dirty}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-admin-accent to-admin-accent/80 px-5 py-2.5 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50"
                            >
                                {profileForm.processing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                                {t('admin.common.save', 'Enregistrer')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={savePassword} className="animate-in fade-in-0 slide-in-from-right-2 flex flex-1 flex-col duration-300">
                        <div className="flex-1 space-y-4 px-6 py-5">
                            <SecretField id="pw-current" label={t('admin.profile.current_password', 'Mot de passe actuel')} value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} error={passwordForm.errors.current_password} autoComplete="current-password" />
                            <SecretField id="pw-new" label={t('admin.profile.new_password', 'Nouveau mot de passe')} value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} error={passwordForm.errors.password} autoComplete="new-password" />
                            <PasswordStrength value={passwordForm.data.password} />
                            <SecretField id="pw-confirm" label={t('admin.profile.confirm_password', 'Confirmer le nouveau mot de passe')} value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} error={passwordForm.errors.password_confirmation} autoComplete="new-password" />
                        </div>
                        <div className="sticky bottom-0 flex justify-end border-t border-admin-border bg-admin-card/95 px-6 py-4 backdrop-blur">
                            <button
                                type="submit"
                                disabled={passwordForm.processing || !passwordForm.data.current_password || !passwordForm.data.password}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-admin-accent to-admin-accent/80 px-5 py-2.5 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50"
                            >
                                {passwordForm.processing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
                                {t('admin.profile.change_password', 'Changer le mot de passe')}
                            </button>
                        </div>
                    </form>
                )}
            </SheetContent>
        </Sheet>
    );
}
