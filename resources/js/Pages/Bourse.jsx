import { Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import { Card } from '../Components/ui/card';
import { useTranslations } from '../lib/useTranslations';

const links = [
    {
        title: "Postuler pour une Bourse d'État",
        description:
            "Les demandes de bourses d'études de l'État malagasy se font désormais en ligne via la plateforme officielle du Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESupReS).",
        button: 'Accéder à la plateforme MESupReS',
        href: 'https://boursesext.mesupres.edu.mg/',
    },
    {
        title: 'Créer votre portefeuille Trésor Public',
        description:
            "Inscrivez-vous sur la plateforme du Trésor Public de Madagascar pour créer votre propre portefeuille électronique et gérer directement votre bourse d'études.",
        button: 'Accéder à la plateforme Trésor Public',
        href: 'https://app.tresorpublic.mg:12000/wallet/login',
    },
];

export default function Bourse() {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Bourse d'études" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{t('bourse.titre', "Demande de Bourse d'Études")}</h1>
                    <p className="mt-2 text-white/80">{t('bourse.soustitre', "Nous soutenons l'excellence et l'égalité des chances.")}</p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {links.map((link) => (
                        <Card key={link.title} className="flex flex-col p-7 text-center">
                            <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">{link.title}</h2>
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{link.description}</p>
                            <a
                                href={link.href}
                                target="_blank"
                                rel="noopener"
                                className="mt-5 flex items-center justify-center gap-1.5 rounded-full bg-isstm-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                            >
                                {link.button}
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </a>
                        </Card>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
