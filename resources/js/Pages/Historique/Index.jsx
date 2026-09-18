import { Head } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

export default function Index({ content }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Historique" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-3xl font-bold">{content.histoire_titre}</h1>
                    <p className="mt-2 max-w-2xl text-white/80">{content.histoire_soustitre}</p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <article className="space-y-10">
                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8 dark:bg-slate-800 dark:ring-slate-700">
                        <h2 className="text-xl font-bold text-isstm-navy dark:text-white">{content.creation_contexte}</h2>
                        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{content.creation_p1}</p>
                        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{content.creation_p2}</p>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8 dark:bg-slate-800 dark:ring-slate-700">
                        <h2 className="text-xl font-bold text-isstm-navy dark:text-white">{content.objectifs_majeurs}</h2>
                        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{content.objectifs_p1}</p>
                        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600 dark:text-slate-300">
                            <li>{content.objectif_1}</li>
                            <li>{content.objectif_2}</li>
                            <li>{content.objectif_3}</li>
                        </ul>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8 dark:bg-slate-800 dark:ring-slate-700">
                        <h2 className="text-xl font-bold text-isstm-navy dark:text-white">{content.statut_pedagogie}</h2>
                        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{content.statut_p1}</p>
                        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{content.statut_p2}</p>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8 dark:bg-slate-800 dark:ring-slate-700">
                        <h2 className="text-xl font-bold text-isstm-navy dark:text-white">{content.offre_formation}</h2>
                        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{content.offre_p1}</p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-isstm-navy/5 px-4 py-3 text-center text-sm font-semibold text-isstm-navy dark:bg-white/5 dark:text-white">STI</div>
                            <div className="rounded-xl bg-isstm-navy/5 px-4 py-3 text-center text-sm font-semibold text-isstm-navy dark:bg-white/5 dark:text-white">STGC</div>
                            <div className="rounded-xl bg-isstm-navy/5 px-4 py-3 text-center text-sm font-semibold text-isstm-navy dark:bg-white/5 dark:text-white">STNPA</div>
                        </div>
                    </section>
                </article>
            </main>

            <Footer />
        </div>
    );
}
