import { Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import { Card } from '../Components/ui/card';
import { useTranslations } from '../lib/useTranslations';
import EditableText from '../Components/QuickEdit/EditableText';

export default function Bourse({ content = {} }) {
    const { t } = useTranslations();

    const links = [
        {
            key: 'bourse_lien1',
            logo: '/images/partenariat/mesupres.png',
            title: t(
                'bourse.externe_titre',
                "Postuler pour une Bourse d'État",
            ),
            description: t(
                'bourse.externe_desc',
                "Les demandes de bourses d'études de l'État malagasy se font désormais en ligne via la plateforme officielle du Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESupReS).",
            ),
            button: t(
                'bourse.externe_bouton',
                'Accéder à la plateforme MESupReS',
            ),
            href: 'https://boursesext.mesupres.edu.mg/',
        },
        {
            key: 'bourse_lien2',
            logo: '/images/partenariat/tresor-public.png',
            title: t(
                'bourse.tresor_titre',
                'Créer votre portefeuille Trésor Public',
            ),
            description: t(
                'bourse.tresor_desc',
                "Inscrivez-vous sur la plateforme du Trésor Public de Madagascar pour créer votre propre portefeuille électronique et gérer directement votre bourse d'études.",
            ),
            button: t(
                'bourse.tresor_bouton',
                'Accéder à la plateforme Trésor Public',
            ),
            href: 'https://app.tresorpublic.mg:12000/wallet/login',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Bourse d'études" />

            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        {t(
                            'bourse.titre',
                            "Demande de Bourse d'Études",
                        )}
                    </h1>

                    <p className="mt-2 text-white/80">
                        {t(
                            'bourse.soustitre',
                            "Nous soutenons l'excellence et l'égalité des chances.",
                        )}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {links.map((link) => (
                        <Card
                            key={link.key}
                            className="flex flex-col items-center p-7 text-center"
                        >
                            <img
                                src={link.logo}
                                alt=""
                                className="h-32 w-auto object-contain sm:h-40"
                                loading="lazy"
                            />

                            <EditableText
                                as="h2"
                                contentKey={`${link.key}_titre`}
                                className="mt-6 text-lg font-semibold text-isstm-navy dark:text-white"
                            >
                                {content[`${link.key}_titre`] ?? link.title}
                            </EditableText>

                            <EditableText
                                as="p"
                                contentKey={`${link.key}_description`}
                                className="mt-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
                            >
                                {content[`${link.key}_description`] ??
                                    link.description}
                            </EditableText>

                            <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 flex items-center justify-center gap-1.5 rounded-full bg-isstm-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                            >
                                {link.button}

                                <ExternalLink
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </a>
                        </Card>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}