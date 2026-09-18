import { Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

export default function Show({ profile }) {
    const { t } = useTranslations();

    const roleLabels = {
        admin: t('profil.role_admin', 'Administrateur'),
        enseignant: t('profil.role_enseignant', 'Enseignant'),
        etudiant: t('profil.role_etudiant', 'Étudiant'),
        user: t('profil.role_utilisateur', 'Utilisateur'),
        bibliotheque: t('profil.role_bibliotheque', 'Bibliothèque'),
        materiel: t('profil.role_materiel', 'Matériel'),
    };

    const links = [
        { key: 'facebook_url', label: 'Facebook' },
        { key: 'linkedin_url', label: 'LinkedIn' },
        { key: 'personal_website', label: t('profil.site_web', 'Site web') },
    ].filter((link) => profile[link.key]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={profile.name} />
            <SiteHeader />

            <main className="mx-auto max-w-2xl px-6 py-12">
                <Card className="p-8 text-center">
                    <Avatar className="mx-auto h-24 w-24 ring-4 ring-isstm-gold/30">
                        <AvatarImage src={profile.avatar_path ? `/storage/${profile.avatar_path}` : undefined} alt="" />
                        <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <h1 className="mt-4 text-xl font-bold text-isstm-navy dark:text-white">{profile.name}</h1>
                    <Badge className="mt-1">{roleLabels[profile.role] ?? profile.role}</Badge>

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
                </Card>
            </main>

            <Footer />
        </div>
    );
}
