import { Head } from '@inertiajs/react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';

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
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Bourse d'études" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-3xl font-bold">Demande de Bourse d'Études</h1>
                    <p className="mt-2 text-white/80">Nous soutenons l'excellence et l'égalité des chances.</p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {links.map((link) => (
                        <div key={link.title} className="flex flex-col rounded-2xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-100">
                            <h2 className="text-lg font-semibold text-isstm-navy">{link.title}</h2>
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{link.description}</p>
                            <a
                                href={link.href}
                                target="_blank"
                                rel="noopener"
                                className="mt-5 inline-block rounded-full bg-isstm-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                            >
                                {link.button} ↗
                            </a>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
