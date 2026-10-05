import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, KeyRound, Lock, ShieldAlert } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { useTranslations } from '../../../lib/useTranslations';

/** Shown instead of the archive until the archive key is entered. */
export default function Locked({ lockedOutFor }) {
    const { t } = useTranslations();
    const form = useForm({ password: '' });
    const [visible, setVisible] = useState(false);

    function submit(e) {
        e.preventDefault();
        form.post('/console/archives/unlock', { preserveScroll: true, onFinish: () => form.reset('password') });
    }

    return (
        <AdminLayout title={t('admin.archives.title', 'Archives des actions')}>
            <div className="mx-auto flex max-w-md flex-col items-center pt-10">
                <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-admin-accent to-admin-accent/70 text-admin-accent-foreground shadow-xl shadow-admin-accent/30">
                    <Lock className="h-9 w-9" aria-hidden="true" />
                </span>
                <h2 className="text-xl font-semibold text-admin-text">{t('admin.archives.protected_title', 'Archive protégée')}</h2>
                <p className="mt-2 text-center text-sm text-admin-text-secondary">
                    {t('admin.archives.protected_hint', "Seule la personne qui détient la clé peut consulter, annoter ou restaurer les archives des actions. Chaque tentative est enregistrée.")}
                </p>

                <form onSubmit={submit} className="admin-card mt-6 w-full space-y-4 p-5">
                    <label htmlFor="archive-key" className="block text-sm font-medium text-admin-text">
                        {t('admin.archives.key_label', "Clé de l'archive")}
                    </label>
                    <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <input
                            id="archive-key"
                            type={visible ? 'text' : 'password'}
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            autoComplete="off"
                            autoFocus
                            className="h-11 w-full rounded-lg border border-admin-border bg-admin-bg/40 pl-10 pr-11 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                        />
                        <button
                            type="button"
                            onClick={() => setVisible((v) => !v)}
                            aria-label={visible ? t('admin.archives.hide_key', 'Masquer la clé') : t('admin.archives.show_key', 'Afficher la clé')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-admin-muted transition hover:text-admin-text"
                        >
                            {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                        </button>
                    </div>

                    {form.errors.password && (
                        <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
                            <ShieldAlert className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            {form.errors.password}
                        </p>
                    )}
                    {lockedOutFor && !form.errors.password && (
                        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-500">
                            {t('admin.archives.locked_out', 'Trop de tentatives. Réessayez dans :seconds secondes.').replace(':seconds', lockedOutFor)}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing || !form.data.password}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2.5 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50"
                    >
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        {t('admin.archives.unlock', "Déverrouiller l'archive")}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
