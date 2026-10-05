import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Eye, FileText, FolderClock, Heart, Mail, MessageCircle, Phone, User, Users, UsersRound } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

const tooltipStyle = { borderRadius: 8, fontSize: 13, border: '1px solid var(--color-slate-200)' };
const axisTick = { fill: 'currentColor', fontSize: 11 };
const pieColors = ['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#64748b', '#dc2626'];

const STATUS_TONES = {
    brouillon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    en_attente: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    en_cours_examen: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    a_completer: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    approuve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    validee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    refuse: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
    annulee: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(value) {
    return new Date(value).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status, label }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[status] ?? STATUS_TONES.brouillon}`}>
            {label}
        </span>
    );
}

function DossierRecordRow({ record }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-700">
            <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                    {record.label}
                    {record.numero_dossier && <span className="ml-2 font-mono text-xs text-slate-400">{record.numero_dossier}</span>}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                    {record.filiere ?? '—'}
                    {record.niveau ? ` · ${record.niveau}` : ''} · {formatDate(record.created_at)}
                </p>
            </div>
            <StatusBadge status={record.status} label={record.status_label} />
        </div>
    );
}

export default function Index({ stats, viewsOverTime, reactionsByType, dossier, account }) {
    const { t } = useTranslations();

    const cards = [
        { key: 'posts_count', icon: FileText, label: t('dashboard.publications', 'Publications'), value: stats.posts_count },
        { key: 'post_views_count', icon: Eye, label: t('dashboard.vues_publications', 'Vues sur vos publications'), value: stats.post_views_count },
        { key: 'reactions_received', icon: Heart, label: t('dashboard.reactions_recues', 'Réactions reçues'), value: stats.reactions_received },
        { key: 'comments_received', icon: MessageCircle, label: t('dashboard.commentaires_recus', 'Commentaires reçus'), value: stats.comments_received },
        { key: 'stories_count', icon: FileText, label: t('dashboard.stories_publiees', 'Stories publiées'), value: stats.stories_count },
        { key: 'story_views_count', icon: Eye, label: t('dashboard.vues_stories', 'Vues sur vos stories'), value: stats.story_views_count },
        { key: 'friends_count', icon: Users, label: t('dashboard.amis', 'Amis'), value: stats.friends_count },
        { key: 'groups_count', icon: UsersRound, label: t('dashboard.groupes', 'Groupes'), value: stats.groups_count },
    ];

    return (
        <AppLayout title={t('dashboard.titre', 'Tableau de bord')}>
            <Head title="Tableau de bord" />

            <Link href="/communaute" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('communaute.retour_fil', 'Retour au fil')}
            </Link>

            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                {t('dashboard.sous_titre', "Aperçu de votre activité et de votre portée sur l'espace communautaire.")}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.key} className="p-5">
                        <card.icon className="h-5 w-5 text-community-accent" aria-hidden="true" />
                        <p className="mt-3 text-2xl font-bold text-isstm-navy dark:text-white">{card.value}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{card.label}</p>
                    </Card>
                ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <Card className="p-5 text-slate-600 dark:text-slate-300">
                    <h2 className="text-sm font-semibold text-isstm-navy dark:text-white">
                        {t('dashboard.vues_14_jours', 'Vues reçues — 14 derniers jours')}
                    </h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={viewsOverTime} margin={{ left: -20, right: 10, top: 16 }}>
                            <defs>
                                <linearGradient id="dashboardViewsFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-community-accent)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--color-community-accent)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="currentColor" className="text-slate-100 dark:text-slate-700" vertical={false} />
                            <XAxis dataKey="date" tick={axisTick} className="text-slate-400" axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={axisTick} className="text-slate-400" axisLine={false} tickLine={false} width={30} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area
                                type="monotone"
                                dataKey="total"
                                name={t('dashboard.vues', 'Vues')}
                                stroke="var(--color-community-accent)"
                                strokeWidth={2}
                                fill="url(#dashboardViewsFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-5 text-slate-600 dark:text-slate-300">
                    <h2 className="text-sm font-semibold text-isstm-navy dark:text-white">
                        {t('dashboard.repartition_reactions', 'Répartition des réactions')}
                    </h2>
                    {reactionsByType.length === 0 ? (
                        <p className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                            {t('dashboard.aucune_reaction', 'Aucune réaction reçue pour le moment.')}
                        </p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Pie data={reactionsByType} dataKey="total" nameKey="type" innerRadius={45} outerRadius={70} paddingAngle={2}>
                                        {reactionsByType.map((entry, index) => (
                                            <Cell key={entry.type} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <ul className="mt-2 space-y-1.5">
                                {reactionsByType.map((entry, index) => (
                                    <li key={entry.type} className="flex items-center gap-2 text-xs">
                                        <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                                        <span className="flex-1 truncate">
                                            {entry.emoji} {entry.type}
                                        </span>
                                        <span className="font-medium text-isstm-navy dark:text-white">{entry.total}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Card>
            </div>

            {dossier && (
                <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                    <Card className="p-5 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-isstm-navy dark:text-white">
                                <FolderClock className="h-4 w-4" aria-hidden="true" />
                                {t('dashboard.suivi_dossier', 'Suivi de mon dossier')}
                            </h2>
                            <StatusBadge status={dossier.current.status} label={dossier.current.status_label} />
                        </div>

                        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                                {dossier.current.label}
                                {dossier.current.numero_dossier && (
                                    <span className="ml-2 font-mono text-xs text-slate-400">{dossier.current.numero_dossier}</span>
                                )}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                                {dossier.current.filiere ?? '—'}
                                {dossier.current.niveau ? ` · ${dossier.current.niveau}` : ''}
                            </p>
                            {dossier.current.commentaire_correction && (
                                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{dossier.current.commentaire_correction}</p>
                            )}
                            {dossier.current.motif_refus && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{dossier.current.motif_refus}</p>
                            )}
                        </div>

                        <ol className="mt-4 space-y-3 border-l border-slate-200 pl-4 dark:border-slate-700">
                            {dossier.timeline.map((entry, index) => (
                                <li key={index} className="relative">
                                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-isstm-navy dark:bg-white" />
                                    <p className="text-sm text-slate-700 dark:text-slate-200">{entry.label}</p>
                                    <p className="text-xs text-slate-400">{formatDateTime(entry.date)}</p>
                                </li>
                            ))}
                        </ol>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="p-5 text-slate-600 dark:text-slate-300">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-isstm-navy dark:text-white">
                                <User className="h-4 w-4" aria-hidden="true" />
                                {t('dashboard.mon_compte', 'Mon compte')}
                            </h2>
                            <dl className="mt-3 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                                    <dd className="truncate">{account.email}</dd>
                                </div>
                                {account.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                                        <dd>{account.phone}</dd>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                                    <dd>{t('dashboard.membre_depuis', 'Membre depuis le')} {formatDate(account.member_since)}</dd>
                                </div>
                            </dl>
                        </Card>

                        {dossier.archives.length > 0 && (
                            <Card className="p-5 text-slate-600 dark:text-slate-300">
                                <h2 className="text-sm font-semibold text-isstm-navy dark:text-white">
                                    {t('dashboard.archives_dossier', 'Archives de mon dossier')}
                                </h2>
                                <div className="mt-3 space-y-2">
                                    {dossier.archives.map((record) => (
                                        <DossierRecordRow key={`${record.kind}-${record.id}`} record={record} />
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
