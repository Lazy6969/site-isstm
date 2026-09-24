import { Head, router, usePage } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

function timeAgo(dateString) {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000);
    if (days < 1) return "aujourd'hui";
    if (days === 1) return 'hier';
    if (days < 30) return `il y a ${days} j`;

    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Show({ profile, friendsCount, postsCount, posts, photos }) {
    const { t } = useTranslations();
    const { auth } = usePage().props;
    const [tab, setTab] = useState('tout');
    const isCommunityViewer = ['admin', 'enseignant', 'etudiant'].includes(auth?.user?.role);

    const roleLabels = {
        admin: t('profil.role_admin', 'Administrateur'),
        enseignant: t('profil.role_enseignant', 'Enseignant'),
        etudiant: t('profil.role_etudiant', 'Étudiant'),
        user: t('profil.role_utilisateur', 'Utilisateur'),
        materiel: t('profil.role_materiel', 'Matériel'),
    };

    const links = [
        { key: 'facebook_url', label: 'Facebook' },
        { key: 'linkedin_url', label: 'LinkedIn' },
        { key: 'personal_website', label: t('profil.site_web', 'Site web') },
    ].filter((link) => profile[link.key]);

    function goToPage(url) {
        if (url) {
            router.get(url, {}, { preserveScroll: true, preserveState: true });
        }
    }

    const content = (
        <>
            <Card className="overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-isstm-navy to-isstm-navy-dark sm:h-56">
                    {profile.cover_path && (
                        <img src={`/storage/${profile.cover_path}`} alt="" className="h-full w-full object-cover" />
                    )}
                </div>

                <div className="px-6 pb-6 text-center sm:px-8">
                    <Avatar className="-mt-12 h-24 w-24 ring-4 ring-white dark:ring-slate-800 sm:-mt-14 sm:h-28 sm:w-28">
                        <AvatarImage src={profile.avatar_path ? `/storage/${profile.avatar_path}` : undefined} alt="" />
                        <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                    </Avatar>

                    <h1 className="mt-3 text-xl font-bold text-isstm-navy dark:text-white">{profile.name}</h1>
                    <Badge className="mt-1">{roleLabels[profile.role] ?? profile.role}</Badge>

                    <div className="mt-4 flex justify-center gap-8 border-t border-slate-100 pt-4 dark:border-slate-700">
                        <div>
                            <p className="text-lg font-bold text-isstm-navy dark:text-white">{friendsCount}</p>
                            <p className="text-xs text-slate-400">{t('profil.amis', 'Amis')}</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-isstm-navy dark:text-white">{postsCount}</p>
                            <p className="text-xs text-slate-400">{t('profil.publications', 'Publications')}</p>
                        </div>
                    </div>

                    {profile.bio && <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{profile.bio}</p>}

                    {(profile.city || profile.interests) && (
                        <dl className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 dark:border-slate-700 pt-6 text-left text-sm sm:grid-cols-2">
                            {profile.city && (
                                <div>
                                    <dt className="text-slate-400 dark:text-slate-500">{t('profil.ville', 'Ville')}</dt>
                                    <dd className="font-medium text-slate-700 dark:text-slate-200">{profile.city}</dd>
                                </div>
                            )}
                            {profile.interests && (
                                <div>
                                    <dt className="text-slate-400 dark:text-slate-500">{t('profil.centres_interet', "Centres d'intérêt")}</dt>
                                    <dd className="font-medium text-slate-700 dark:text-slate-200">{profile.interests}</dd>
                                </div>
                            )}
                        </dl>
                    )}

                    {links.length > 0 && (
                        <div className="mt-6 flex justify-center gap-4 border-t border-slate-100 dark:border-slate-700 pt-6 text-sm">
                            {links.map((link) => (
                                <a
                                    key={link.key}
                                    href={profile[link.key]}
                                    target="_blank"
                                    rel="noopener"
                                    className="flex items-center gap-1.5 font-medium text-isstm-navy dark:text-white hover:underline"
                                >
                                    {link.label}
                                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <div className="mt-6 flex gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                <button
                    type="button"
                    onClick={() => setTab('tout')}
                    className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${tab === 'tout' ? 'bg-isstm-navy text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    {t('profil.tout', 'Tout')}
                </button>
                <button
                    type="button"
                    onClick={() => setTab('photos')}
                    className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${tab === 'photos' ? 'bg-isstm-navy text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    {t('profil.photos', 'Photos')}
                </button>
            </div>

            {tab === 'tout' && (
                <div className="mt-4 space-y-4">
                    {posts.data.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                            {t('profil.aucune_publication', "Aucune publication pour l'instant.")}
                        </p>
                    )}
                    {posts.data.map((post) => (
                        <Card key={post.id} className="p-5">
                            <p className="text-xs text-slate-400">{timeAgo(post.created_at)}</p>
                            {post.body && <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{post.body}</p>}
                            {post.media.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {post.media.map((media) =>
                                        media.type === 'image' ? (
                                            <img key={media.id} src={`/storage/${media.path}`} alt="" className="aspect-square rounded-lg object-cover" />
                                        ) : (
                                            <div key={media.id} className="flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-slate-700">
                                                {media.type}
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                    {(posts.prev_page_url || posts.next_page_url) && (
                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                disabled={!posts.prev_page_url}
                                onClick={() => goToPage(posts.prev_page_url)}
                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-40 dark:text-slate-300"
                            >
                                {t('pagination.precedent', 'Précédent')}
                            </button>
                            <button
                                disabled={!posts.next_page_url}
                                onClick={() => goToPage(posts.next_page_url)}
                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-40 dark:text-slate-300"
                            >
                                {t('pagination.suivant', 'Suivant')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tab === 'photos' && (
                <div className="mt-4">
                    {photos.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                            {t('profil.aucune_photo', 'Aucune photo pour l’instant.')}
                        </p>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {photos.map((photo) => (
                                <img key={photo.id} src={`/storage/${photo.path}`} alt="" className="aspect-square rounded-lg object-cover" />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );

    if (isCommunityViewer) {
        return (
            <AppLayout>
                <Head title={profile.name} />
                <div className="mx-auto max-w-3xl">{content}</div>
            </AppLayout>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={profile.name} />
            <SiteHeader />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">{content}</main>

            <Footer />
        </div>
    );
}
