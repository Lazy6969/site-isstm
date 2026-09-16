import { Head, Link, usePage } from '@inertiajs/react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import OrgNode from '../Components/Parcours/OrgNode';
import { administrativePole, cursusLadder, direction, pedagogicalPole } from '../Components/Parcours/orgChartData';

export default function Parcours() {
    const { auth } = usePage().props;
    const isLoggedIn = Boolean(auth?.user);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Organigramme & Parcours" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-3xl font-bold">Organigramme & Parcours</h1>
                    <p className="mt-2 text-white/80">Structure organisationnelle et académique de l'ISSTM.</p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl space-y-14 px-6 py-12">
                <p className="text-base leading-relaxed text-slate-700">
                    Derrière chaque diplôme délivré par l'ISSTM se cache une organisation rigoureuse, portée par
                    des femmes et des hommes engagés à chaque échelon, de la gouvernance aux équipes de terrain.
                </p>

                <section>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">Gouvernance</h2>
                    <div className="space-y-3">
                        <div className="rounded-xl border border-isstm-navy/20 bg-isstm-navy/5 px-4 py-3">
                            <span className="block text-sm font-semibold text-isstm-navy">Conseil d'Établissement</span>
                            <span className="block text-xs text-slate-500">Organe collégial</span>
                        </div>
                        <div className="rounded-xl bg-isstm-navy px-4 py-3 text-white">
                            <span className="block text-sm font-semibold">Directeur</span>
                            <span className="block text-xs text-white/70">Dr. Hary Tiana R.</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">Direction & Services Rattachés</h2>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {direction.map((item) => (
                            <div key={item.title} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                <span className="block text-sm font-semibold text-isstm-navy">{item.title}</span>
                                <span className="block text-xs text-slate-500">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        Pôle Pédagogique & Pôle Administratif
                    </h2>
                    <p className="mb-4 text-sm text-slate-500">Cliquez sur un pôle pour découvrir son équipe.</p>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <OrgNode node={pedagogicalPole} />
                        <OrgNode node={administrativePole} />
                    </div>
                </section>

                <section>
                    <p className="mb-6 text-base leading-relaxed text-slate-700">
                        Du baccalauréat scientifique jusqu'au Master, chaque étape de votre parcours à l'ISSTM est
                        pensée pour vous mener, pas à pas, vers l'excellence.
                    </p>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">Schéma du Cursus</h2>
                    <ol className="space-y-3">
                        {[...cursusLadder].reverse().map((step) => (
                            <li key={step.key} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                                <span className="font-semibold text-isstm-navy">{step.level}</span>
                                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm text-slate-500">
                                    {step.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-isstm-navy">Télécharger les Documents</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Retrouvez l'organigramme et le cursus complet de l'ISSTM dans le format qui vous convient.
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[
                            { title: 'Organigramme Complet', desc: "La structure organisationnelle complète de l'institut." },
                            { title: 'Cursus Académique', desc: 'Le détail des filières, mentions et parcours proposés.' },
                        ].map((doc) => (
                            <div key={doc.title} className="rounded-xl border border-slate-200 p-4 text-center">
                                <h3 className="font-semibold text-isstm-navy">{doc.title}</h3>
                                <p className="mt-1 text-xs text-slate-500">{doc.desc}</p>
                                {isLoggedIn ? (
                                    <p className="mt-3 text-xs font-medium text-slate-400">Téléchargements à venir</p>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="mt-3 inline-block rounded-full bg-isstm-navy px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                                    >
                                        Connectez-vous pour télécharger
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
