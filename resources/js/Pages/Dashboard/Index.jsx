import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, FileText, Heart, MessageCircle, Users, UsersRound } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

const tooltipStyle = { borderRadius: 8, fontSize: 13, border: '1px solid var(--color-slate-200)' };
const axisTick = { fill: 'currentColor', fontSize: 11 };
const pieColors = ['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#64748b', '#dc2626'];

export default function Index({ stats, viewsOverTime, reactionsByType }) {
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
        </AppLayout>
    );
}
