import { Head } from '@inertiajs/react';
import { Eye, FileText, Heart, MessageCircle, Users, UsersRound } from 'lucide-react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ stats }) {
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
        </AppLayout>
    );
}
