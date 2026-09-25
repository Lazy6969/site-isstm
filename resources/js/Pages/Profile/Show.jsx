import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AtSign,
    ArrowLeft,
    Briefcase,
    Cake,
    ExternalLink,
    GraduationCap,
    Home,
    MapPin,
    Pencil,
} from 'lucide-react';
import { useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import AppLayout from '../../Components/Layout/AppLayout';
import PostCard from '../../Components/Communaute/PostCard';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

function formatBirthday(dateString) {
    if (!dateString) return null;

    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export default function Show({ profile, isOwnProfile, friendsCount, friendsPreview, postsCount, posts, photos }) {
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

    const socialHandles = [
        { key: 'instagram_handle', label: 'Instagram', icon: AtSign },
        { key: 'snapchat_handle', label: 'Snapchat', icon: AtSign },
        { key: 'tiktok_handle', label: 'TikTok', icon: AtSign },
    ].filter((s) => profile[s.key]);

    const infoRows = [
        profile.city && { icon: Home, text: `${t('profil.habite_a', 'Habite à')} ${profile.city}` },
        profile.hometown && { icon: MapPin, text: `${t('profil.de', 'De')} ${profile.hometown}` },
        formatBirthday(profile.birth_date) && { icon: Cake, text: formatBirthday(profile.birth_date) },
    ].filter(Boolean);

    function goToPage(url) {
        if (url) {
            router.get(url, {}, { preserveScroll: true, preserveState: true });
        }
    }

    const sidebar = (
        <div className="space-y-4">
            {infoRows.length > 0 && (
                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy dark:text-white">
                        {t('profil.informations_personnelles', 'Informations personnelles')}
                    </h2>
                    <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                        {infoRows.map((row) => (
                            <li key={row.text} className="flex items-center gap-2.5">
                                <row.icon className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
                                {row.text}
                            </li>
                        ))}
                    </ul>
                    {profile.interests && (
                        <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            {profile.interests}
                        </p>
                    )}
                </Card>
            )}

            {(profile.profession || profile.employer) && (
                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy dark:text-white">
                        {t('profil.experience_professionnelle', 'Expérience professionnelle')}
                    </h2>
                    <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
                        <span>
                            {profile.profession}
                            {profile.employer && <span className="block text-xs text-slate-400">{profile.employer}</span>}
                        </span>
                    </div>
                </Card>
            )}

            {profile.education && (
                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy dark:text-white">{t('profil.formation', 'Formation')}</h2>
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <GraduationCap className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
                        {profile.education}
                    </div>
                </Card>
            )}

            {(links.length > 0 || socialHandles.length > 0) && (
                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy dark:text-white">{t('profil.coordonnees', 'Coordonnées')}</h2>
                    <ul className="space-y-2.5 text-sm">
                        {links.map((link) => (
                            <li key={link.key}>
                                <a
                                    href={profile[link.key]}
                                    target="_blank"
                                    rel="noopener"
                                    className="flex items-center gap-1.5 font-medium text-isstm-navy hover:underline dark:text-white"
                                >
                                    {link.label}
                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                </a>
                            </li>
                        ))}
                        {socialHandles.map((s) => (
                            <li key={s.key} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <s.icon className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
                                {s.label} · {profile[s.key]}
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-isstm-navy dark:text-white">
                        {t('profil.amis', 'Ami(e)s')} · {friendsCount}
                    </h2>
                    {isOwnProfile && (
                        <Link href="/amis" className="text-xs font-medium text-slate-400 hover:text-isstm-navy dark:hover:text-white">
                            {t('communaute.voir_tout', 'Tout voir')}
                        </Link>
                    )}
                </div>
                {friendsPreview.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500">{t('profil.aucun_ami', "Pas encore d'amis.")}</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {friendsPreview.map((friend) => (
                            <Link key={friend.id} href={`/profil/${friend.id}`} className="text-center">
                                <Avatar className="mx-auto h-14 w-14">
                                    <AvatarImage src={friend.avatar_path ? `/storage/${friend.avatar_path}` : undefined} alt="" />
                                    <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{friend.name}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </Card>

            {photos.length > 0 && (
                <Card className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-isstm-navy dark:text-white">{t('profil.photos', 'Photos')}</h2>
                        <button onClick={() => setTab('photos')} className="text-xs font-medium text-slate-400 hover:text-isstm-navy dark:hover:text-white">
                            {t('profil.toutes_les_photos', 'Toutes les photos')}
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {photos.slice(0, 9).map((photo) => (
                            <img key={photo.id} src={`/storage/${photo.path}`} alt="" className="aspect-square rounded-lg object-cover" />
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );

    const content = (
        <>
            {isCommunityViewer && (
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mb-4 flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t('profil.retour', 'Retour')}
                </button>
            )}

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

                    {isOwnProfile && (
                        <div className="mt-4 flex justify-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
                            <Link
                                href="/tableau-de-bord"
                                className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white hover:bg-isstm-navy-dark"
                            >
                                {t('nav.tableau_bord', 'Tableau de bord')}
                            </Link>
                            <Link
                                href="/profil/modifier"
                                className="flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50"
                            >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('profil.modifier', 'Modifier')}
                            </Link>
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

            <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="hidden lg:block">{sidebar}</div>

                <div className="min-w-0">
                    {tab === 'tout' && (
                        <div className="space-y-4">
                            <div className="lg:hidden">{sidebar}</div>

                            {isOwnProfile && (
                                <Link
                                    href="/communaute"
                                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                >
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={profile.avatar_path ? `/storage/${profile.avatar_path}` : undefined} alt="" />
                                        <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-left text-sm text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                        {t('communaute.publier_statut', 'Publier un statut')}
                                    </span>
                                </Link>
                            )}

                            {posts.data.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                                    {t('profil.aucune_publication', "Aucune publication pour l'instant.")}
                                </p>
                            )}
                            {posts.data.map((post) => (
                                <PostCard key={post.id} post={post} />
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
                        <div>
                            <div className="mb-4 lg:hidden">{sidebar}</div>
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
                </div>
            </div>
        </>
    );

    if (isCommunityViewer) {
        return (
            <AppLayout>
                <Head title={profile.name} />
                <div className="mx-auto max-w-5xl">{content}</div>
            </AppLayout>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={profile.name} />
            <SiteHeader />

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">{content}</main>

            <Footer />
        </div>
    );
}
