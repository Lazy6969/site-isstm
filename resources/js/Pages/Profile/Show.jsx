import { Head } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

const roleLabels = {
    admin: 'Administrateur',
    enseignant: 'Enseignant',
    etudiant: 'Étudiant',
    user: 'Utilisateur',
    bibliotheque: 'Bibliothèque',
    materiel: 'Matériel',
};

export default function Show({ profile }) {
    const links = [
        { key: 'facebook_url', label: 'Facebook' },
        { key: 'linkedin_url', label: 'LinkedIn' },
        { key: 'personal_website', label: 'Site web' },
    ].filter((link) => profile[link.key]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={profile.name} />
            <SiteHeader />

            <main className="mx-auto max-w-2xl px-6 py-12">
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
                    <img
                        src={profile.avatar_path ? `/storage/${profile.avatar_path}` : '/images/logo-isstm.jpg'}
                        alt=""
                        className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-isstm-gold/30"
                    />
                    <h1 className="mt-4 text-xl font-bold text-isstm-navy">{profile.name}</h1>
                    <span className="mt-1 inline-block rounded-full bg-isstm-navy/10 px-3 py-1 text-xs font-semibold text-isstm-navy">
                        {roleLabels[profile.role] ?? profile.role}
                    </span>

                    {profile.bio && <p className="mt-4 text-sm leading-relaxed text-slate-600">{profile.bio}</p>}

                    {(profile.city || profile.interests) && (
                        <dl className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-6 text-left text-sm sm:grid-cols-2">
                            {profile.city && (
                                <div>
                                    <dt className="text-slate-400">Ville</dt>
                                    <dd className="font-medium text-slate-700">{profile.city}</dd>
                                </div>
                            )}
                            {profile.interests && (
                                <div>
                                    <dt className="text-slate-400">Centres d'intérêt</dt>
                                    <dd className="font-medium text-slate-700">{profile.interests}</dd>
                                </div>
                            )}
                        </dl>
                    )}

                    {links.length > 0 && (
                        <div className="mt-6 flex justify-center gap-4 border-t border-slate-100 pt-6 text-sm">
                            {links.map((link) => (
                                <a
                                    key={link.key}
                                    href={profile[link.key]}
                                    target="_blank"
                                    rel="noopener"
                                    className="font-medium text-isstm-navy hover:underline"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
