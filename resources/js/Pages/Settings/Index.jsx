import { Head, Link, usePage } from '@inertiajs/react';
import { Check, LogOut, Moon, Sun, User } from 'lucide-react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import LanguageSwitcher from '../../Components/Layout/LanguageSwitcher';
import { useTranslations } from '../../lib/useTranslations';
import { useDarkMode } from '../../lib/useDarkMode';
import { ACCENT_COLORS, useAccentColor } from '../../lib/useAccentColor';
import { useLogoutConfirm } from '../../lib/useLogoutConfirm';

const ROLE_LABELS = {
    admin: 'Administrateur',
    enseignant: 'Enseignant',
    etudiant: 'Étudiant',
    user: 'Utilisateur',
    materiel: 'Matériel',
};

export default function Index() {
    const { auth } = usePage().props;
    const { t } = useTranslations();
    const user = auth?.user;
    const [dark, setDark] = useDarkMode();
    const [accent, setAccent] = useAccentColor();
    const { requestLogout } = useLogoutConfirm();

    return (
        <AppLayout title={t('parametres.titre', 'Paramètres')}>
            <Head title="Paramètres" />

            <Card className="flex items-center gap-4 p-5">
                <img
                    src={user?.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                    alt=""
                    className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-community-accent"
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-isstm-navy dark:text-white">{user?.name}</p>
                    <p className="text-sm text-slate-400">{ROLE_LABELS[user?.role] ?? user?.role}</p>
                </div>
                <Link
                    href={`/profil/${user?.id}`}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-semibold text-isstm-navy transition hover:border-community-accent hover:text-community-accent dark:border-slate-600 dark:text-white"
                >
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('profil.voir_profil_public', 'Voir mon profil public')}
                </Link>
            </Card>

            <Card className="mt-6 p-5">
                <h2 className="mb-4 text-sm font-semibold text-isstm-navy dark:text-white">
                    {t('parametres.apparence', 'Apparence')}
                </h2>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700">
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        {dark ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
                        {t('parametres.mode_sombre', 'Mode sombre')}
                    </div>
                    <button
                        type="button"
                        onClick={() => setDark((v) => !v)}
                        aria-pressed={dark}
                        aria-label={t('parametres.mode_sombre', 'Mode sombre')}
                        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${dark ? 'bg-community-accent' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                <div className="pt-4">
                    <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{t('parametres.couleur_accent', "Couleur d'accent")}</p>
                    <div className="flex flex-wrap gap-3">
                        {ACCENT_COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setAccent(color.value)}
                                aria-label={color.label}
                                aria-pressed={accent === color.value}
                                title={color.label}
                                className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-white transition dark:ring-offset-slate-800"
                                style={{ backgroundColor: color.hex, '--tw-ring-color': accent === color.value ? color.hex : 'transparent' }}
                            >
                                {accent === color.value && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <Card className="mt-6 flex items-center justify-between p-5">
                <span className="text-sm font-semibold text-isstm-navy dark:text-white">{t('parametres.langue', "Langue de l'application")}</span>
                <LanguageSwitcher className="!border-slate-200 !text-isstm-navy hover:!border-community-accent hover:!text-community-accent dark:!border-slate-600 dark:!text-white" />
            </Card>

            <button
                type="button"
                onClick={requestLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
            >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t('nav.deconnexion', 'Déconnexion')}
            </button>
        </AppLayout>
    );
}
