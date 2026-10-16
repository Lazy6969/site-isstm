import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, Film, Settings, Wallet } from 'lucide-react';
import MemoriesDialog from './MemoriesDialog';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Entry points pinned atop the right sidebar: Souvenirs (opens a dialog),
 * and three links — Paramètres du profil, Réels and (students only, gated
 * the same way AdminSidebar gates its own entries) l'espace écolage.
 */
export default function ShortcutsSidebar() {
    const { t } = useTranslations();
    const { props } = usePage();
    const permissions = props.auth?.permissions ?? [];
    const [memoriesOpen, setMemoriesOpen] = useState(false);

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="space-y-0.5">
                <button
                    type="button"
                    onClick={() => setMemoriesOpen(true)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
                >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {t('communaute.souvenirs', 'Souvenirs')}
                </button>

                <Link
                    href="/communaute/reels"
                    className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
                >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-fuchsia-500/15 text-fuchsia-600">
                        <Film className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {t('communaute.voir_reels', 'Voir les Reels')}
                </Link>

                {permissions.includes('ecolage.view') && (
                    <Link
                        href="/ecolage"
                        className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
                    >
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                            <Wallet className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {t('communaute.espace_ecolage', "Mon espace écolage")}
                    </Link>
                )}

                <Link
                    href="/profil"
                    className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
                >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-300">
                        <Settings className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {t('communaute.parametres_profil', 'Paramètres du profil')}
                </Link>
            </div>

            <MemoriesDialog open={memoriesOpen} onClose={() => setMemoriesOpen(false)} />
        </div>
    );
}
