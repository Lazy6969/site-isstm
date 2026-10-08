import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, ClipboardCheck, GraduationCap, Newspaper, RotateCcw, UserPlus } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const TONES = {
    sky: { tile: 'bg-sky-500/15 text-sky-500', bar: 'bg-sky-500' },
    violet: { tile: 'bg-violet-500/15 text-violet-500', bar: 'bg-violet-500' },
    amber: { tile: 'bg-amber-500/15 text-amber-500', bar: 'bg-amber-500' },
    emerald: { tile: 'bg-emerald-500/15 text-emerald-500', bar: 'bg-emerald-500' },
};

function useQueueMeta() {
    const { t } = useTranslations();

    return {
        preinscriptions: {
            icon: UserPlus,
            tone: 'sky',
            label: t('admin.dashboard.todo_preinscriptions', 'Préinscriptions'),
            hint: t('admin.dashboard.todo_preinscriptions_hint', 'Dossiers à examiner'),
        },
        reinscriptions: {
            icon: GraduationCap,
            tone: 'violet',
            label: t('admin.dashboard.todo_reinscriptions', 'Réinscriptions'),
            hint: t('admin.dashboard.todo_reinscriptions_hint', 'Dossiers étudiants soumis'),
        },
        reactivations: {
            icon: RotateCcw,
            tone: 'amber',
            label: t('admin.dashboard.todo_reactivations', 'Réactivations'),
            hint: t('admin.dashboard.todo_reactivations_hint', 'Comptes à réactiver'),
        },
        articles: {
            icon: Newspaper,
            tone: 'emerald',
            label: t('admin.dashboard.todo_articles', 'Articles'),
            hint: t('admin.dashboard.todo_articles_hint', 'À valider avant publication'),
        },
    };
}

/**
 * The work waiting on the admin team — one row per queue the account may open,
 * with how many items are waiting, a bar showing each queue's share of the
 * total, and a link to the page that clears it.
 */
export default function PendingQueue({ queues }) {
    const { t } = useTranslations();
    const meta = useQueueMeta();
    const visible = queues.filter((queue) => meta[queue.key]);
    const total = visible.reduce((sum, queue) => sum + queue.count, 0);

    if (visible.length === 0) {
        return null;
    }

    return (
        <section className="admin-card relative overflow-hidden p-5" aria-labelledby="pending-queue-title">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-admin-accent/10 blur-3xl" aria-hidden="true" />

            <div className="relative mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                    <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 id="pending-queue-title" className="text-sm font-semibold text-admin-text">
                        {t('admin.dashboard.todo_title', 'À traiter')}
                    </h2>
                    <p className="text-xs text-admin-muted">{t('admin.dashboard.todo_subtitle', 'Ce qui attend une décision')}</p>
                </div>
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
                        total > 0 ? 'bg-admin-accent text-admin-accent-foreground' : 'bg-emerald-500/15 text-emerald-500'
                    }`}
                >
                    {total > 0 ? total : t('admin.dashboard.todo_up_to_date', 'À jour')}
                </span>
            </div>

            {total === 0 ? (
                <div className="relative flex flex-col items-center gap-2 rounded-xl border border-dashed border-admin-border py-8 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-admin-text">{t('admin.dashboard.todo_all_clear', 'Tout est traité')}</p>
                    <p className="text-xs text-admin-muted">{t('admin.dashboard.todo_all_clear_hint', 'Aucun dossier en attente pour le moment.')}</p>
                </div>
            ) : (
                <ul className="relative space-y-1">
                    {visible.map((queue) => {
                        const { icon: Icon, tone, label, hint } = meta[queue.key];
                        const share = total > 0 ? Math.max(queue.count > 0 ? 6 : 0, Math.round((queue.count / total) * 100)) : 0;

                        return (
                            <li key={queue.key}>
                                <Link href={queue.href} className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-admin-hover">
                                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${TONES[tone].tile}`}>
                                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-baseline justify-between gap-2">
                                            <span className="truncate text-sm font-medium text-admin-text">{label}</span>
                                            <span className={`text-base font-bold tabular-nums ${queue.count > 0 ? 'text-admin-text' : 'text-admin-muted'}`}>{queue.count}</span>
                                        </span>
                                        <span className="mt-0.5 block truncate text-xs text-admin-muted">{hint}</span>
                                        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-admin-hover" aria-hidden="true">
                                            <span className={`block h-full rounded-full transition-all duration-500 ${TONES[tone].bar}`} style={{ width: `${share}%` }} />
                                        </span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-admin-muted transition-transform group-hover:translate-x-0.5 group-hover:text-admin-accent" aria-hidden="true" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
